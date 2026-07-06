"""
Scoring router — score all candidates for a job, get results, export CSV.
Also provides the /score-live endpoint reused by Module B.
"""
from __future__ import annotations

import csv
import io
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Candidate, Job, Score
from schemas import LiveScoreRequest
from services.scoring_engine import score_resume, DEFAULT_WEIGHTS

logger = logging.getLogger(__name__)
router = APIRouter(tags=["scoring"])


# ── Module A: score all candidates for a job ───────────────────────────────

@router.post("/jobs/{job_id}/score")
def score_job_candidates(job_id: int, db: Session = Depends(get_db)):
    """
    Score all successfully-parsed candidates for a job.
    Uses the job's weight profile; falls back to defaults if not configured.
    Re-scores existing scores (idempotent).
    """
    job = _get_job_or_404(db, job_id)
    requirements = job.requirements
    if not requirements:
        raise HTTPException(status_code=400, detail="Job has no requirements configured. Update requirements first.")

    wp = job.weight_profile
    weights = wp.as_dict if wp else DEFAULT_WEIGHTS

    candidates = db.query(Candidate).filter(
        Candidate.job_id == job_id,
        Candidate.parse_status == "success",
    ).all()

    if not candidates:
        raise HTTPException(status_code=400, detail="No successfully parsed candidates found for this job.")

    scored_count = 0
    errors: list[dict] = []

    for candidate in candidates:
        try:
            result = score_resume(candidate.parsed_data, requirements, weights)

            if candidate.score:
                s = candidate.score
            else:
                s = Score(candidate_id=candidate.id)
                db.add(s)

            s.total_score = result["total_score"]
            s.breakdown = result["breakdown"]
            s.warnings = result["warnings"]
            scored_count += 1
        except Exception as exc:
            logger.error("Scoring failed for candidate %d: %s", candidate.id, exc)
            errors.append({"candidate_id": candidate.id, "filename": candidate.filename, "error": str(exc)})

    db.commit()

    return {
        "job_id": job_id,
        "scored": scored_count,
        "errors": errors,
    }


@router.get("/jobs/{job_id}/results")
def get_results(job_id: int, db: Session = Depends(get_db)):
    """
    Return the ranked shortlist for a job.
    Each entry includes the composite score, per-factor breakdown, and warnings.
    """
    _get_job_or_404(db, job_id)

    candidates = (
        db.query(Candidate)
        .filter(Candidate.job_id == job_id, Candidate.parse_status == "success")
        .all()
    )

    results = []
    for c in candidates:
        if not c.score:
            continue
        s = c.score
        parsed = c.parsed_data

        # Build plain-language summary
        breakdown = s.breakdown
        sorted_factors = sorted(breakdown.items(), key=lambda x: x[1]["score"], reverse=True)
        best = sorted_factors[0] if sorted_factors else ("", {"score": 0})
        worst = sorted_factors[-1] if sorted_factors else ("", {"score": 0})

        plain = (
            f"Scored {s.total_score:.0f}/100 — "
            f"strong in {best[0].capitalize()} ({best[1]['score']:.0f}), "
            f"weak in {worst[0].capitalize()} ({worst[1]['score']:.0f}). "
            f"{worst[1].get('explanation', '')}"
        )

        results.append({
            "candidate_id": c.id,
            "filename": c.filename,
            "name": parsed.get("name", c.filename),
            "email": parsed.get("email", ""),
            "total_score": s.total_score,
            "breakdown": breakdown,
            "warnings": s.warnings,
            "plain_summary": plain,
            "parsed_data": parsed,
        })

    # Sort by score descending
    results.sort(key=lambda x: x["total_score"], reverse=True)

    # ── Bias audit aggregates ──────────────────────────────────────────────
    # Show graduation year distribution (proxy for age) without exposing
    # individual protected attributes
    grad_years: list[int] = []
    for r in results:
        for edu in r["parsed_data"].get("education", []):
            if edu.get("year_end"):
                grad_years.append(edu["year_end"])

    bias_audit = {}
    if grad_years:
        grad_years_sorted = sorted(grad_years)
        bias_audit["graduation_year_distribution"] = {
            "min": grad_years_sorted[0],
            "max": grad_years_sorted[-1],
            "median": grad_years_sorted[len(grad_years_sorted) // 2],
            "note": (
                "Distribution of graduation years in the shortlist. "
                "A narrow range may introduce age bias. "
                "You can re-run scoring with 'education' weight set to 0 to see the impact."
            ),
        }

    return {
        "job_id": job_id,
        "total_scored": len(results),
        "results": results,
        "bias_audit": bias_audit,
    }


@router.get("/jobs/{job_id}/results/csv")
def export_csv(job_id: int, db: Session = Depends(get_db)):
    """Export the shortlist as a CSV file."""
    _get_job_or_404(db, job_id)

    candidates = (
        db.query(Candidate)
        .filter(Candidate.job_id == job_id, Candidate.parse_status == "success")
        .all()
    )

    rows = []
    for c in candidates:
        if not c.score:
            continue
        parsed = c.parsed_data
        s = c.score
        bd = s.breakdown
        rows.append({
            "Rank": "",  # filled after sort
            "Name": parsed.get("name", c.filename),
            "Email": parsed.get("email", ""),
            "Total Score": s.total_score,
            "Education": bd.get("education", {}).get("score", ""),
            "Experience": bd.get("experience", {}).get("score", ""),
            "Projects": bd.get("projects", {}).get("score", ""),
            "Skills": bd.get("skills", {}).get("score", ""),
            "Certifications": bd.get("certifications", {}).get("score", ""),
            "Extras": bd.get("extras", {}).get("score", ""),
            "Warnings": "; ".join(s.warnings),
            "File": c.filename,
        })

    rows.sort(key=lambda x: x["Total Score"], reverse=True)
    for i, row in enumerate(rows, 1):
        row["Rank"] = i

    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.read().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=shortlist_job_{job_id}.csv"},
    )


# ── Shared: live scoring (reused by Module B) ──────────────────────────────

@router.post("/score-live")
def score_live(payload: LiveScoreRequest):
    """
    Score a resume dict against a JD requirements dict in real time.
    Used by Module B's live feedback panel. No DB writes.
    """
    weights = payload.weights.model_dump() if payload.weights else DEFAULT_WEIGHTS
    try:
        result = score_resume(payload.resume_data, payload.jd_requirements.model_dump(), weights)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Live scoring error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Scoring failed: {exc}")

    return result


# ── Helper ─────────────────────────────────────────────────────────────────

def _get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    return job
