"""
Jobs router — CRUD for job postings + JD extraction + weight profiles.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Job, WeightProfile
from schemas import JobCreate, JobRequirementsUpdate, WeightsIn
from services.jd_parser import parse_jd

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    """Create a new job posting and auto-extract JD requirements."""
    job = Job(title=payload.title, jd_text=payload.jd_text)
    try:
        job.requirements = parse_jd(payload.jd_text)
    except Exception as exc:
        logger.warning("JD parsing failed for new job '%s': %s", payload.title, exc)
        job.requirements = {"title": payload.title, "description": payload.jd_text}

    # Default weight profile
    wp = WeightProfile(job=job)
    db.add(job)
    db.add(wp)
    db.commit()
    db.refresh(job)

    return {
        "id": job.id,
        "title": job.title,
        "requirements": job.requirements,
        "weights": wp.as_dict,
        "created_at": job.created_at.isoformat(),
    }


@router.get("")
def list_jobs(db: Session = Depends(get_db)):
    """List all job postings."""
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "created_at": j.created_at.isoformat(),
            "candidate_count": len(j.candidates),
        }
        for j in jobs
    ]


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job posting with its requirements and weight profile."""
    job = _get_job_or_404(db, job_id)
    wp = job.weight_profile
    return {
        "id": job.id,
        "title": job.title,
        "jd_text": job.jd_text,
        "requirements": job.requirements,
        "weights": wp.as_dict if wp else None,
        "created_at": job.created_at.isoformat(),
    }


@router.put("/{job_id}/requirements")
def update_requirements(job_id: int, payload: JobRequirementsUpdate, db: Session = Depends(get_db)):
    """
    Recruiter confirms/edits the extracted requirements and optionally sets weights.
    This is the step where the recruiter adjusts auto-extracted fields before scoring.
    """
    job = _get_job_or_404(db, job_id)
    job.requirements = payload.requirements.model_dump()

    if payload.weights:
        _upsert_weights(db, job, payload.weights)

    db.commit()
    db.refresh(job)
    return {"id": job.id, "requirements": job.requirements}


@router.put("/{job_id}/weights")
def update_weights(job_id: int, payload: WeightsIn, db: Session = Depends(get_db)):
    """Update scoring weights for a job. Validates that weights sum to 1.0."""
    job = _get_job_or_404(db, job_id)
    _upsert_weights(db, job, payload)
    db.commit()
    wp = job.weight_profile
    db.refresh(wp)
    return {"job_id": job_id, "weights": wp.as_dict}


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = _get_job_or_404(db, job_id)
    db.delete(job)
    db.commit()


# ── Helpers ────────────────────────────────────────────────────────────────

def _get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    return job


def _upsert_weights(db: Session, job: Job, weights: WeightsIn):
    if job.weight_profile:
        wp = job.weight_profile
    else:
        wp = WeightProfile(job=job)
        db.add(wp)

    wp.education      = weights.education
    wp.experience     = weights.experience
    wp.projects       = weights.projects
    wp.skills         = weights.skills
    wp.certifications = weights.certifications
    wp.extras         = weights.extras
