"""
JD parser — extract structured requirements from a free-text job description.

Uses regex heuristics first, then optionally keyword extraction.
All extraction is best-effort; recruiter can always confirm/edit the results.
"""
from __future__ import annotations

import re
from typing import Any


# ── Skill vocabulary used for JD scanning ─────────────────────────────────

_SKILL_VOCAB = [
    # Programming languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "Ruby", "Swift", "Kotlin", "Scala", "R", "PHP", "Perl", "MATLAB",
    # Web / Frontend
    "React", "Angular", "Vue", "HTML", "CSS", "Tailwind", "Next.js", "Node.js",
    "Express", "jQuery", "Bootstrap", "Webpack",
    # Backend
    "Django", "Flask", "FastAPI", "Spring", "Rails", "Laravel", "ASP.NET",
    # Data / ML
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science",
    "Spark", "Hadoop", "Tableau", "Power BI", "ETL",
    # Cloud / DevOps
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "CI/CD", "GitHub Actions", "Linux", "Bash",
    # Databases
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "DynamoDB", "Cassandra", "SQLite",
    # Other
    "GraphQL", "REST", "gRPC", "Microservices", "Agile", "Scrum", "Git",
]

_SKILL_LOWER = {s.lower(): s for s in _SKILL_VOCAB}

EDUCATION_LEVELS = [
    "phd", "doctorate", "doctoral",
    "masters", "master's", "master", "mba", "m.s.", "msc",
    "bachelors", "bachelor's", "bachelor", "b.s.", "b.a.", "bsc",
    "associate", "diploma",
]
EDUCATION_LEVEL_MAP = {
    "phd": "phd", "doctorate": "phd", "doctoral": "phd",
    "masters": "masters", "master's": "masters", "master": "masters",
    "mba": "masters", "m.s.": "masters", "msc": "masters",
    "bachelors": "bachelors", "bachelor's": "bachelors", "bachelor": "bachelors",
    "b.s.": "bachelors", "b.a.": "bachelors", "bsc": "bachelors",
    "associate": "associate",
    "diploma": "diploma",
}

CERT_KEYWORDS = ["aws", "gcp", "azure", "pmp", "cpa", "cissp", "ceh", "ccna", "comptia", "cfa", "six sigma", "itil"]


def parse_jd(jd_text: str) -> dict[str, Any]:
    """
    Extract structured requirements from a raw JD text.

    Returns a dict matching the JDRequirements schema.
    """
    if not jd_text or not jd_text.strip():
        return _empty_requirements()

    text = jd_text.strip()

    return {
        "title": _extract_title(text),
        "required_skills": _extract_required_skills(text),
        "preferred_skills": _extract_preferred_skills(text),
        "min_experience_years": _extract_min_experience(text),
        "education_level": _extract_education_level(text),
        "education_field": _extract_education_field(text),
        "required_certifications": _extract_certifications(text),
        "description": text,
    }


def _empty_requirements() -> dict[str, Any]:
    return {
        "title": "",
        "required_skills": [],
        "preferred_skills": [],
        "min_experience_years": 0.0,
        "education_level": "",
        "education_field": "",
        "required_certifications": [],
        "description": "",
    }


def _extract_title(text: str) -> str:
    """Try to pull the job title from the first few lines."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    # First non-empty line that's short (< 80 chars) and looks like a title
    for line in lines[:5]:
        if len(line) < 80 and not line.endswith(":") and len(line.split()) >= 2:
            return line
    return lines[0][:80] if lines else ""


def _extract_min_experience(text: str) -> float:
    """Find the minimum required years of experience."""
    patterns = [
        r"(\d+)\+?\s*(?:years?|yrs?)[\s\w]{0,20}(?:of\s+)?experience",
        r"minimum\s+(?:of\s+)?(\d+)\s*(?:years?|yrs?)",
        r"at least\s+(\d+)\s*(?:years?|yrs?)",
        r"(\d+)[-–](\d+)\s*(?:years?|yrs?)",
        r"(\d+)\+?\s*(?:years?|yrs?)\s+[A-Za-z]",  # "5+ years Python/React/etc."
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return float(m.group(1))
    return 0.0


def _extract_education_level(text: str) -> str:
    """Detect the required education level."""
    lower = text.lower()
    for level in EDUCATION_LEVELS:
        if level in lower:
            return EDUCATION_LEVEL_MAP.get(level, level)
    return ""


def _extract_education_field(text: str) -> str:
    """Try to extract the required field of study."""
    # Pattern: "degree in Computer Science" — stop at stopwords, not just punctuation
    m = re.search(
        r"(?:degree|bachelor|master|phd|diploma)\s+(?:in|of)\s+"
        r"([A-Za-z\s&/]+?)(?:\s*(?:required|preferred|or|and|with|,|\.|\n|$))",
        text, re.IGNORECASE
    )
    if m:
        field = m.group(1).strip()
        if len(field) < 60:
            return field
    # Look for common STEM fields
    fields = ["Computer Science", "Engineering", "Information Technology", "Data Science",
              "Mathematics", "Physics", "Business", "Finance", "Statistics",
              "Electrical Engineering", "Mechanical Engineering", "Software Engineering"]
    for field in fields:
        if re.search(r"\b" + re.escape(field) + r"\b", text, re.I):
            return field
    return ""


def _extract_required_skills(text: str) -> list[str]:
    """Extract required skills from requirement/qualification sections."""
    # Try to isolate the "Required" section
    required_block = _extract_block(text, r"required|must.have|mandatory|qualifications?|minimum")
    source = required_block if required_block else text
    return _scan_for_skills(source)


def _extract_preferred_skills(text: str) -> list[str]:
    """Extract preferred/nice-to-have skills."""
    preferred_block = _extract_block(text, r"preferred|nice.to.have|bonus|plus|desirable|optional")
    if not preferred_block:
        return []
    return _scan_for_skills(preferred_block)


def _extract_certifications(text: str) -> list[str]:
    """
    Find explicit certification requirements.
    Only triggers when the cert keyword appears near certification-context words
    to avoid false positives (e.g. "experience in AWS" ≠ AWS certification required).
    """
    certs = []
    lower = text.lower()

    # Must be near cert-context words to count as a required certification
    cert_context_pattern = re.compile(
        r"(certificat|certif|licens|accredit|credential|required\s+cert|cert\.\s+required)",
        re.IGNORECASE
    )
    if not cert_context_pattern.search(text):
        # No certification-context found — skip keyword scan
        pass
    else:
        for cert_kw in CERT_KEYWORDS:
            if cert_kw in lower:
                certs.append(cert_kw.upper())

    # Explicit "Certified XYZ" / "XYZ Certification" patterns (always valid)
    for m in re.finditer(
        r"\b([A-Z][A-Za-z]+(?:\s+[A-Za-z]+){0,4})\s+(?:Certified|Certification)\b",
        text
    ):
        cert = m.group(0).strip()[:80]
        if cert not in certs:
            certs.append(cert)
    for m in re.finditer(
        r"\bCertified\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,4})\b",
        text
    ):
        cert = m.group(0).strip()[:80]
        if cert not in certs:
            certs.append(cert)

    return list(dict.fromkeys(certs))


def _extract_block(text: str, heading_pattern: str) -> str:
    """
    Extract a section of text that starts with a line matching heading_pattern
    and ends at the next section heading or double newline.
    """
    lines = text.split("\n")
    in_block = False
    block_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        if re.search(heading_pattern, stripped, re.I) and len(stripped) < 80:
            in_block = True
            continue
        if in_block:
            # Stop at next section heading
            if (re.search(r"^[A-Z][A-Za-z\s]+:?\s*$", stripped) and len(stripped) < 60):
                break
            block_lines.append(stripped)

    return "\n".join(block_lines)


def _scan_for_skills(text: str) -> list[str]:
    """Scan text for known tech skills using the vocabulary list."""
    lower = text.lower()
    found: list[str] = []
    for skill_lower, skill_canonical in _SKILL_LOWER.items():
        # Use word-boundary matching for short terms to avoid false positives
        if len(skill_lower) <= 3:
            if re.search(r"\b" + re.escape(skill_lower) + r"\b", lower):
                found.append(skill_canonical)
        else:
            if skill_lower in lower:
                found.append(skill_canonical)
    return list(dict.fromkeys(found))
