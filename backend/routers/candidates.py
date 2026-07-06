"""
Candidates router — batch resume upload, parsing, and retrieval.
One bad file never crashes the whole batch.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
from models import Candidate, Job
from services.resume_parser import parse_resume, ParseError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs/{job_id}/candidates", tags=["candidates"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per file
ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resumes(
    job_id: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """
    Batch-upload multiple PDF/DOCX resumes against a job.
    Each file is parsed independently; failures are recorded but do not stop
    the rest of the batch from processing.
    """
    job = _get_job_or_404(db, job_id)

    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")

    succeeded_ids: list[int] = []
    failures: list[dict] = []

    for upload in files:
        filename = upload.filename or "unknown"
        candidate = Candidate(job_id=job.id, filename=filename, parse_status="pending")
        db.add(candidate)
        db.flush()  # get the ID before parsing

        try:
            # Validate content type (browsers don't always set this correctly, so
            # we also validate by extension inside the parser)
            content_type = upload.content_type or ""
            if content_type and content_type not in ALLOWED_TYPES:
                raise ParseError(f"Unsupported content type '{content_type}'. Upload PDF or DOCX only.")

            file_bytes = await upload.read()

            if not file_bytes:
                raise ParseError("Uploaded file is empty.")
            if len(file_bytes) > MAX_FILE_SIZE:
                raise ParseError(f"File exceeds 10 MB limit ({len(file_bytes)//1024//1024} MB).")

            parsed = parse_resume(file_bytes, filename)

            candidate.parse_status = "success"
            candidate.parsed_data = parsed
            succeeded_ids.append(candidate.id)
            logger.info("Parsed resume '%s' (candidate_id=%d)", filename, candidate.id)

        except ParseError as exc:
            candidate.parse_status = "failed"
            candidate.parse_error = str(exc)
            failures.append({"filename": filename, "error": str(exc)})
            logger.warning("Parse failed for '%s': %s", filename, exc)

        except Exception as exc:
            candidate.parse_status = "failed"
            candidate.parse_error = f"Unexpected error: {exc}"
            failures.append({"filename": filename, "error": f"Unexpected error: {exc}"})
            logger.exception("Unexpected parse error for '%s'", filename)

    db.commit()

    return {
        "total": len(files),
        "succeeded": len(succeeded_ids),
        "failed": len(failures),
        "failures": failures,
        "candidates": succeeded_ids,
    }


@router.get("")
def list_candidates(job_id: int, db: Session = Depends(get_db)):
    """List all candidates for a job."""
    _get_job_or_404(db, job_id)
    candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
    return [
        {
            "id": c.id,
            "filename": c.filename,
            "parse_status": c.parse_status,
            "parse_error": c.parse_error,
            "name": (c.parsed_data or {}).get("name", ""),
            "has_score": c.score is not None,
        }
        for c in candidates
    ]


@router.get("/{candidate_id}")
def get_candidate(job_id: int, candidate_id: int, db: Session = Depends(get_db)):
    """Get a single candidate's parsed resume data."""
    candidate = _get_candidate_or_404(db, job_id, candidate_id)
    return {
        "id": candidate.id,
        "filename": candidate.filename,
        "parse_status": candidate.parse_status,
        "parse_error": candidate.parse_error,
        "parsed_data": candidate.parsed_data,
    }


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(job_id: int, candidate_id: int, db: Session = Depends(get_db)):
    candidate = _get_candidate_or_404(db, job_id, candidate_id)
    db.delete(candidate)
    db.commit()


# ── Helpers ────────────────────────────────────────────────────────────────

def _get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    return job


def _get_candidate_or_404(db: Session, job_id: int, candidate_id: int) -> Candidate:
    c = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.job_id == job_id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found for job {job_id}.")
    return c
