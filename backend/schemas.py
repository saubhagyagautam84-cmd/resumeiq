"""Pydantic v2 request/response schemas."""
from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field, field_validator, model_validator


# ── Shared sub-schemas ─────────────────────────────────────────────────────

class EducationEntry(BaseModel):
    degree: str = ""
    field: str = ""
    institution: str = ""
    year_start: int | None = None
    year_end: int | None = None
    gpa: float | None = None


class ExperienceEntry(BaseModel):
    title: str = ""
    company: str = ""
    start_date: str = ""   # "YYYY-MM" or "YYYY" or free text
    end_date: str = ""     # "" or "Present"
    is_current: bool = False
    duration_months: int | None = None
    description: str = ""
    skills_mentioned: list[str] = []


class ProjectEntry(BaseModel):
    title: str = ""
    description: str = ""
    skills: list[str] = []
    links: list[str] = []


class ParsedResume(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""
    summary: str = ""
    education: list[EducationEntry] = []
    experience: list[ExperienceEntry] = []
    projects: list[ProjectEntry] = []
    skills: list[str] = []
    certifications: list[str] = []
    extras: dict[str, Any] = {}


# ── JD / Requirements ──────────────────────────────────────────────────────

class JDRequirements(BaseModel):
    title: str = ""
    required_skills: list[str] = []
    preferred_skills: list[str] = []
    min_experience_years: float = 0.0
    education_level: str = ""          # "bachelors", "masters", "phd", etc.
    education_field: str = ""
    required_certifications: list[str] = []
    description: str = ""              # original JD text (kept for embedding)


# ── Weight profile ─────────────────────────────────────────────────────────

class WeightsIn(BaseModel):
    education: float = Field(0.20, ge=0, le=1)
    experience: float = Field(0.25, ge=0, le=1)
    projects: float = Field(0.20, ge=0, le=1)
    skills: float = Field(0.20, ge=0, le=1)
    certifications: float = Field(0.10, ge=0, le=1)
    extras: float = Field(0.05, ge=0, le=1)

    @model_validator(mode="after")
    def must_sum_to_one(self) -> "WeightsIn":
        total = round(
            self.education + self.experience + self.projects +
            self.skills + self.certifications + self.extras, 4
        )
        if abs(total - 1.0) > 0.01:
            raise ValueError(f"Weights must sum to 1.0 (100%), got {total:.4f}")
        return self


# ── Job CRUD ───────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    jd_text: str = Field(..., min_length=10)


class JobRequirementsUpdate(BaseModel):
    requirements: JDRequirements
    weights: WeightsIn | None = None


class JobOut(BaseModel):
    id: int
    title: str
    jd_text: str
    requirements: dict
    created_at: str

    model_config = {"from_attributes": True}


# ── Candidate / scoring output ─────────────────────────────────────────────

class FactorScore(BaseModel):
    score: float          # 0-100
    weight: float         # applied weight (0-1)
    weighted: float       # score * weight
    explanation: str
    details: dict[str, Any] = {}


class ScoreBreakdown(BaseModel):
    education: FactorScore
    experience: FactorScore
    projects: FactorScore
    skills: FactorScore
    certifications: FactorScore
    extras: FactorScore


class CandidateScoreOut(BaseModel):
    candidate_id: int
    filename: str
    total_score: float
    breakdown: dict[str, Any]
    warnings: list[str]
    parsed_data: dict[str, Any]


class BatchUploadResult(BaseModel):
    total: int
    succeeded: int
    failed: int
    failures: list[dict[str, str]]  # [{filename, error}]
    candidates: list[int]           # IDs of successfully parsed candidates


# ── Module B ───────────────────────────────────────────────────────────────

class BuilderResumeCreate(BaseModel):
    resume_data: dict[str, Any] = {}
    target_jd_text: str | None = None


class BuilderResumeUpdate(BaseModel):
    resume_data: dict[str, Any] | None = None
    target_jd_text: str | None = None


class BulletRewriteRequest(BaseModel):
    raw_text: str = Field(..., min_length=5, max_length=2000)
    context: str = ""   # optional: role title or section name for context


class BulletRewriteResponse(BaseModel):
    rewritten: str
    model_used: str


class LiveScoreRequest(BaseModel):
    resume_data: dict[str, Any]
    jd_requirements: JDRequirements
    weights: WeightsIn | None = None


class ExportRequest(BaseModel):
    resume_id: int
    format: str = Field("pdf", pattern="^(pdf|docx)$")
