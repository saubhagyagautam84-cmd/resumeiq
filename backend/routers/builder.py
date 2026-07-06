"""
Builder router — Module B endpoints for resume construction, AI rewriting, and export.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from database import get_db
from models import BuilderResume
from schemas import (
    BuilderResumeCreate,
    BuilderResumeUpdate,
    BulletRewriteRequest,
    ExportRequest,
)
from services.jd_parser import parse_jd
from services.ai_rewriter import rewrite_bullet
from services.export_service import export_pdf, export_docx, self_test_export

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/builder", tags=["builder"])


@router.post("/resumes", status_code=201)
def create_builder_resume(payload: BuilderResumeCreate, db: Session = Depends(get_db)):
    """Create a new builder resume session (Module B)."""
    br = BuilderResume(resume_data=payload.resume_data or {})
    if payload.target_jd_text:
        br.target_jd_text = payload.target_jd_text
        try:
            br.target_jd_requirements = parse_jd(payload.target_jd_text)
        except Exception as exc:
            logger.warning("JD parsing failed in builder: %s", exc)
            br.target_jd_requirements = {"description": payload.target_jd_text}
    db.add(br)
    db.commit()
    db.refresh(br)
    return _serialize(br)


@router.get("/resumes/{resume_id}")
def get_builder_resume(resume_id: int, db: Session = Depends(get_db)):
    br = _get_or_404(db, resume_id)
    return _serialize(br)


@router.put("/resumes/{resume_id}")
def update_builder_resume(resume_id: int, payload: BuilderResumeUpdate, db: Session = Depends(get_db)):
    """Partial update — only the fields present in the payload are updated."""
    br = _get_or_404(db, resume_id)

    if payload.resume_data is not None:
        br.resume_data = payload.resume_data

    if payload.target_jd_text is not None:
        br.target_jd_text = payload.target_jd_text
        try:
            br.target_jd_requirements = parse_jd(payload.target_jd_text)
        except Exception as exc:
            logger.warning("JD parsing failed in builder update: %s", exc)
            br.target_jd_requirements = {"description": payload.target_jd_text}

    db.commit()
    db.refresh(br)
    return _serialize(br)


@router.post("/rewrite-bullet")
async def rewrite_bullet_endpoint(payload: BulletRewriteRequest):
    """
    Rewrite a rough bullet point using Claude.
    Returns a suggestion only — the frontend must confirm before inserting.
    """
    if not payload.raw_text.strip():
        raise HTTPException(status_code=422, detail="raw_text cannot be empty.")

    try:
        rewritten, model_used = await rewrite_bullet(payload.raw_text, payload.context)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in bullet rewriter")
        raise HTTPException(status_code=500, detail=f"Rewrite failed: {exc}")

    return {"rewritten": rewritten, "model_used": model_used}


@router.post("/resumes/{resume_id}/export")
def export_resume(resume_id: int, payload: ExportRequest, db: Session = Depends(get_db)):
    """
    Export a builder resume to PDF or DOCX.
    Runs a self-test after generation and returns warnings in headers if any.
    """
    br = _get_or_404(db, resume_id)

    fmt = payload.format.lower()
    filename = f"resume.{fmt}"

    try:
        if fmt == "pdf":
            file_bytes = export_pdf(br.resume_data)
            media_type = "application/pdf"
        else:
            file_bytes = export_docx(br.resume_data)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Export failed for resume_id=%d", resume_id)
        raise HTTPException(status_code=500, detail=f"Export failed: {exc}")

    # Self-test
    warnings = self_test_export(file_bytes, filename)
    headers = {
        "Content-Disposition": f"attachment; filename={filename}",
        "X-Self-Test-Warnings": "; ".join(warnings) if warnings else "",
    }

    return Response(content=file_bytes, media_type=media_type, headers=headers)


@router.post("/resumes/{resume_id}/set-jd")
def set_target_jd(resume_id: int, body: dict, db: Session = Depends(get_db)):
    """Set or update the target JD for a builder resume (triggers live score)."""
    br = _get_or_404(db, resume_id)
    jd_text = body.get("jd_text", "")
    if not jd_text.strip():
        raise HTTPException(status_code=422, detail="jd_text cannot be empty.")
    br.target_jd_text = jd_text
    try:
        br.target_jd_requirements = parse_jd(jd_text)
    except Exception as exc:
        br.target_jd_requirements = {"description": jd_text}
    db.commit()
    db.refresh(br)
    return {"requirements": br.target_jd_requirements}


# ── Helpers ────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, resume_id: int) -> BuilderResume:
    br = db.query(BuilderResume).filter(BuilderResume.id == resume_id).first()
    if not br:
        raise HTTPException(status_code=404, detail=f"Builder resume {resume_id} not found.")
    return br


def _serialize(br: BuilderResume) -> dict:
    return {
        "id": br.id,
        "resume_data": br.resume_data,
        "target_jd_text": br.target_jd_text,
        "target_jd_requirements": br.target_jd_requirements,
        "created_at": br.created_at.isoformat(),
        "updated_at": br.updated_at.isoformat(),
    }
