"""SQLAlchemy ORM models. JSON columns store parsed/structured data."""
import json
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Job(Base):
    """A job posting created by a recruiter (Module A)."""
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    jd_text: Mapped[str] = mapped_column(Text, nullable=False)
    # Extracted + recruiter-confirmed requirements stored as JSON string
    requirements_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    weight_profile: Mapped["WeightProfile | None"] = relationship("WeightProfile", back_populates="job", uselist=False, cascade="all, delete-orphan")
    candidates: Mapped[list["Candidate"]] = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")

    @property
    def requirements(self) -> dict:
        if self.requirements_json:
            return json.loads(self.requirements_json)
        return {}

    @requirements.setter
    def requirements(self, value: dict):
        self.requirements_json = json.dumps(value)


class WeightProfile(Base):
    """Scoring weight configuration per job posting."""
    __tablename__ = "weight_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id"), nullable=False, unique=True)
    education: Mapped[float] = mapped_column(Float, default=0.20)
    experience: Mapped[float] = mapped_column(Float, default=0.25)
    projects: Mapped[float] = mapped_column(Float, default=0.20)
    skills: Mapped[float] = mapped_column(Float, default=0.20)
    certifications: Mapped[float] = mapped_column(Float, default=0.10)
    extras: Mapped[float] = mapped_column(Float, default=0.05)

    job: Mapped["Job"] = relationship("Job", back_populates="weight_profile")

    @property
    def as_dict(self) -> dict:
        return {
            "education": self.education,
            "experience": self.experience,
            "projects": self.projects,
            "skills": self.skills,
            "certifications": self.certifications,
            "extras": self.extras,
        }


class Candidate(Base):
    """A parsed resume uploaded against a job."""
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    parse_status: Mapped[str] = mapped_column(String(50), default="pending")  # pending|success|failed
    parse_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Full structured resume as JSON
    parsed_data_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    job: Mapped["Job"] = relationship("Job", back_populates="candidates")
    score: Mapped["Score | None"] = relationship("Score", back_populates="candidate", uselist=False, cascade="all, delete-orphan")

    @property
    def parsed_data(self) -> dict:
        if self.parsed_data_json:
            return json.loads(self.parsed_data_json)
        return {}

    @parsed_data.setter
    def parsed_data(self, value: dict):
        self.parsed_data_json = json.dumps(value)


class Score(Base):
    """Scoring result for a candidate against a job."""
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(Integer, ForeignKey("candidates.id"), nullable=False, unique=True)
    total_score: Mapped[float] = mapped_column(Float, nullable=False)
    # Per-factor scores + explanations stored as JSON
    breakdown_json: Mapped[str] = mapped_column(Text, nullable=False)
    # Warning flags (anti-gaming, timeline issues) as JSON list
    warnings_json: Mapped[str] = mapped_column(Text, default="[]")
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="score")

    @property
    def breakdown(self) -> dict:
        return json.loads(self.breakdown_json)

    @breakdown.setter
    def breakdown(self, value: dict):
        self.breakdown_json = json.dumps(value)

    @property
    def warnings(self) -> list:
        return json.loads(self.warnings_json)

    @warnings.setter
    def warnings(self, value: list):
        self.warnings_json = json.dumps(value)


class BuilderResume(Base):
    """A resume being constructed in Module B."""
    __tablename__ = "builder_resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # Resume data stored as JSON (same schema as parsed Candidate data)
    resume_data_json: Mapped[str] = mapped_column(Text, default="{}")
    target_jd_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_jd_requirements_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def resume_data(self) -> dict:
        return json.loads(self.resume_data_json)

    @resume_data.setter
    def resume_data(self, value: dict):
        self.resume_data_json = json.dumps(value)

    @property
    def target_jd_requirements(self) -> dict:
        if self.target_jd_requirements_json:
            return json.loads(self.target_jd_requirements_json)
        return {}

    @target_jd_requirements.setter
    def target_jd_requirements(self, value: dict):
        self.target_jd_requirements_json = json.dumps(value)
