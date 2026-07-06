"""
Scoring engine — pure functions with no database or HTTP dependencies.

Design:
- `score_resume(parsed_resume, jd_requirements, weights)` is the single entry point.
- Every sub-scorer returns (score: float 0-100, explanation: str, details: dict).
- Embedding-based similarity is used when sentence-transformers is available;
  falls back to TF-IDF cosine similarity, then Jaccard as a last resort.
- All inputs are plain dicts (same shape as ParsedResume / JDRequirements schemas).
"""
from __future__ import annotations

import re
import math
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ── Default weights ────────────────────────────────────────────────────────

DEFAULT_WEIGHTS: dict[str, float] = {
    "education":      0.20,
    "experience":     0.25,
    "projects":       0.20,
    "skills":         0.20,
    "certifications": 0.10,
    "extras":         0.05,
}

DEGREE_LEVEL_SCORES: dict[str, int] = {
    "phd":         100,
    "masters":      85,
    "bachelors":    70,
    "associate":    45,
    "diploma":      35,
    "high_school":  20,
    "":              0,
}

DEGREE_KEYWORDS: dict[str, list[str]] = {
    "phd":         ["ph.d", "phd", "doctorate", "doctoral"],
    "masters":     ["master", "m.s.", "msc", "mba", "m.eng", "meng", "m.a."],
    "bachelors":   ["bachelor", "b.s.", "b.a.", "b.eng", "b.tech", "btech", "bsc", "b.sc"],
    "associate":   ["associate"],
    "diploma":     ["diploma"],
    "high_school": ["high school", "secondary", "ged"],
}


# ── Embedding layer (lazy-loaded, with fallback) ───────────────────────────

_encoder = None          # sentence-transformers model, if available
_embeddings_broken = False  # set True after first import failure


def _get_encoder():
    global _encoder, _embeddings_broken
    if _embeddings_broken:
        return None
    if _encoder is not None:
        return _encoder
    try:
        from sentence_transformers import SentenceTransformer
        _encoder = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Loaded sentence-transformers model for skill matching.")
    except Exception as exc:
        logger.warning("sentence-transformers unavailable (%s). Using keyword fallback.", exc)
        _embeddings_broken = True
    return _encoder


def _cosine(a: list[float], b: list[float]) -> float:
    import numpy as np
    va, vb = np.array(a), np.array(b)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    return float(np.dot(va, vb) / denom) if denom > 0 else 0.0


def _embed_similarity(texts_a: list[str], texts_b: list[str]) -> float:
    """
    Average cosine similarity between two groups of text strings.
    Uses sentence-transformers if available, else TF-IDF, else Jaccard.
    Returns a value in [0, 1].
    """
    if not texts_a or not texts_b:
        return 0.0

    enc = _get_encoder()
    if enc is not None:
        try:
            embs_a = enc.encode(texts_a, convert_to_numpy=True)
            embs_b = enc.encode(texts_b, convert_to_numpy=True)
            import numpy as np
            # Average embeddings for each group, then cosine
            avg_a = embs_a.mean(axis=0)
            avg_b = embs_b.mean(axis=0)
            denom = np.linalg.norm(avg_a) * np.linalg.norm(avg_b)
            return float(np.dot(avg_a, avg_b) / denom) if denom > 0 else 0.0
        except Exception as exc:
            logger.warning("Embedding similarity failed: %s. Falling back.", exc)

    return _tfidf_similarity(texts_a, texts_b)


def _tfidf_similarity(texts_a: list[str], texts_b: list[str]) -> float:
    """TF-IDF cosine similarity fallback."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        import numpy as np
        combined = [" ".join(texts_a), " ".join(texts_b)]
        vec = TfidfVectorizer(stop_words="english").fit_transform(combined)
        a, b = vec[0].toarray()[0], vec[1].toarray()[0]
        denom = np.linalg.norm(a) * np.linalg.norm(b)
        return float(np.dot(a, b) / denom) if denom > 0 else 0.0
    except Exception:
        pass
    return _jaccard_similarity(texts_a, texts_b)


def _jaccard_similarity(texts_a: list[str], texts_b: list[str]) -> float:
    """Simplest possible fallback: Jaccard on lowercased tokens."""
    tokens_a = set(" ".join(texts_a).lower().split())
    tokens_b = set(" ".join(texts_b).lower().split())
    if not tokens_a or not tokens_b:
        return 0.0
    return len(tokens_a & tokens_b) / len(tokens_a | tokens_b)


# ── Education scorer ───────────────────────────────────────────────────────

def _detect_degree_level(degree_str: str) -> str:
    """Map a free-text degree string to a canonical level key."""
    lower = degree_str.lower()
    for level, keywords in DEGREE_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return level
    return ""


def score_education(
    education_entries: list[dict],
    jd_requirements: dict,
) -> tuple[float, str, dict]:
    """
    Score: 0-100.
    - Degree level compared to JD requirement (60 pts).
    - Field relevance to JD description (40 pts).
    """
    if not education_entries:
        return 0.0, "No education found in resume.", {"degree_level_score": 0, "field_relevance_score": 0}

    required_level = jd_requirements.get("education_level", "").lower()
    required_field = jd_requirements.get("education_field", "")
    jd_description = jd_requirements.get("description", "")

    # Use the highest degree found
    best_level = ""
    best_field = ""
    for entry in education_entries:
        level = _detect_degree_level(entry.get("degree", ""))
        if not best_level or DEGREE_LEVEL_SCORES.get(level, 0) > DEGREE_LEVEL_SCORES.get(best_level, 0):
            best_level = level
            best_field = entry.get("field", "")

    # Degree level score (60 pts)
    candidate_pts = DEGREE_LEVEL_SCORES.get(best_level, 0)
    required_pts = DEGREE_LEVEL_SCORES.get(required_level, 0)
    if required_pts == 0:
        level_score = min(100.0, candidate_pts * 1.2) if candidate_pts else 50.0
    else:
        ratio = candidate_pts / required_pts
        level_score = min(100.0, ratio * 100)

    # Field relevance score (40 pts)
    field_score = 0.0
    if best_field:
        if required_field:
            # Exact / substring match wins immediately
            bf_l, rf_l = best_field.lower(), required_field.lower()
            if bf_l == rf_l or bf_l in rf_l or rf_l in bf_l:
                field_score = 100.0
            else:
                # Compare field vs required_field only (not full JD — avoids dilution)
                field_score = _embed_similarity([best_field], [required_field]) * 100
        elif jd_description:
            # No required field specified — use JD description as proxy
            field_score = _embed_similarity([best_field], [jd_description]) * 100
        else:
            field_score = 50.0  # baseline when JD gives no field signal

    total = 0.6 * level_score + 0.4 * field_score

    explanation = (
        f"Detected degree level: {best_level or 'unknown'} (field: {best_field or 'unknown'}). "
        f"JD requires: {required_level or 'not specified'}. "
        f"Level match: {level_score:.0f}/100, field relevance: {field_score:.0f}/100."
    )
    return round(total, 1), explanation, {"degree_level_score": level_score, "field_relevance_score": field_score, "best_level": best_level}


# ── Experience scorer ──────────────────────────────────────────────────────

def score_experience(
    experience_entries: list[dict],
    jd_requirements: dict,
) -> tuple[float, str, dict]:
    """
    Score: 0-100.
    - Years vs JD minimum (50 pts).
    - Role relevance via title + description similarity to JD (50 pts).
    """
    if not experience_entries:
        return 0.0, "No work experience found in resume.", {"total_years": 0, "years_score": 0, "role_relevance_score": 0}

    required_years = float(jd_requirements.get("min_experience_years", 0) or 0)
    jd_title = jd_requirements.get("title", "")
    jd_description = jd_requirements.get("description", "")
    jd_skills = jd_requirements.get("required_skills", []) + jd_requirements.get("preferred_skills", [])

    # Sum total months across non-overlapping? Use simple sum for MVP.
    total_months = sum(
        e.get("duration_months") or 0
        for e in experience_entries
    )
    total_years = total_months / 12

    # Years score (50 pts)
    if required_years <= 0:
        years_score = min(100.0, 50 + (total_years / 5) * 50)
    else:
        ratio = total_years / required_years
        # Full marks at 1x requirement, slight bonus up to 1.5x, cap at 100
        years_score = min(100.0, ratio * 85 + (max(0, ratio - 1.0) * 15))

    # Role relevance (50 pts): title similarity + description–JD similarity
    titles = [e.get("title", "") for e in experience_entries if e.get("title")]
    descriptions = [e.get("description", "") for e in experience_entries if e.get("description")]

    title_sim = 0.0
    if titles and (jd_title or jd_description):
        title_sim = _embed_similarity(titles, [jd_title or jd_description])

    desc_sim = 0.0
    if descriptions and (jd_description or jd_skills):
        ref = [jd_description] + jd_skills if jd_description else jd_skills
        desc_sim = _embed_similarity(descriptions, ref)

    role_relevance = (0.4 * title_sim + 0.6 * desc_sim) * 100

    total = 0.5 * years_score + 0.5 * role_relevance

    explanation = (
        f"Total experience: {total_years:.1f} years (JD requires {required_years:.0f}+ yrs). "
        f"Years score: {years_score:.0f}/100. "
        f"Role relevance: {role_relevance:.0f}/100."
    )
    return round(total, 1), explanation, {
        "total_years": round(total_years, 1),
        "required_years": required_years,
        "years_score": years_score,
        "role_relevance_score": role_relevance,
    }


# ── Projects scorer ────────────────────────────────────────────────────────

def score_projects(
    project_entries: list[dict],
    jd_requirements: dict,
) -> tuple[float, str, dict]:
    """
    Score: 0-100.
    - Count (up to 4 projects) (30 pts).
    - Relevance of project descriptions to JD (50 pts).
    - Presence of links/proof (20 pts).
    """
    if not project_entries:
        return 0.0, "No projects found in resume.", {"count": 0, "count_score": 0, "relevance_score": 0, "proof_score": 0}

    count = len(project_entries)
    # Count score: log scale, 4 projects = full score
    count_score = min(100.0, (math.log(count + 1) / math.log(5)) * 100)

    # Relevance
    jd_description = jd_requirements.get("description", "")
    jd_skills = jd_requirements.get("required_skills", []) + jd_requirements.get("preferred_skills", [])
    proj_texts = [
        f"{p.get('title', '')} {p.get('description', '')} {' '.join(p.get('skills', []))}"
        for p in project_entries
    ]
    ref = ([jd_description] if jd_description else []) + jd_skills
    relevance_score = _embed_similarity(proj_texts, ref) * 100 if ref else 50.0

    # Proof score
    projects_with_links = sum(1 for p in project_entries if p.get("links"))
    proof_score = min(100.0, (projects_with_links / max(count, 1)) * 100)

    total = 0.30 * count_score + 0.50 * relevance_score + 0.20 * proof_score

    explanation = (
        f"{count} project(s) found. "
        f"Count score: {count_score:.0f}/100, "
        f"relevance: {relevance_score:.0f}/100, "
        f"proof (links): {proof_score:.0f}/100."
    )
    return round(total, 1), explanation, {
        "count": count,
        "count_score": count_score,
        "relevance_score": relevance_score,
        "proof_score": proof_score,
    }


# ── Skills scorer ──────────────────────────────────────────────────────────

def score_skills(
    resume_skills: list[str],
    jd_requirements: dict,
) -> tuple[float, str, dict]:
    """
    Score: 0-100.
    Uses embedding similarity between resume skills and JD required/preferred skills.
    Also computes a direct coverage ratio for transparency.
    """
    jd_required = jd_requirements.get("required_skills", [])
    jd_preferred = jd_requirements.get("preferred_skills", [])
    all_jd_skills = jd_required + jd_preferred

    if not resume_skills:
        return 0.0, "No skills listed in resume.", {"coverage": 0.0, "semantic_score": 0.0}

    if not all_jd_skills:
        return 60.0, "JD lists no specific required skills; awarded baseline score.", {"coverage": None, "semantic_score": None}

    # Semantic similarity (uses embeddings or fallback)
    semantic_score = _embed_similarity(resume_skills, all_jd_skills) * 100

    # Keyword coverage: % of JD skills that have a close match in resume skills
    resume_lower = {s.lower() for s in resume_skills}
    matched = 0
    for skill in all_jd_skills:
        sl = skill.lower()
        if any(sl in rs or rs in sl for rs in resume_lower):
            matched += 1
    coverage = matched / len(all_jd_skills) if all_jd_skills else 0.0

    # Blend: 60% semantic, 40% coverage
    total = 0.60 * semantic_score + 0.40 * (coverage * 100)

    # Weight required skills higher if both lists exist
    if jd_required and jd_preferred:
        req_semantic = _embed_similarity(resume_skills, jd_required) * 100
        pref_semantic = _embed_similarity(resume_skills, jd_preferred) * 100
        blended_semantic = 0.70 * req_semantic + 0.30 * pref_semantic
        total = 0.60 * blended_semantic + 0.40 * (coverage * 100)

    explanation = (
        f"Resume lists {len(resume_skills)} skill(s). "
        f"JD requires {len(jd_required)} + prefers {len(jd_preferred)} skills. "
        f"Keyword coverage: {coverage*100:.0f}%, semantic match: {semantic_score:.0f}/100."
    )
    return round(total, 1), explanation, {
        "coverage": round(coverage, 3),
        "semantic_score": round(semantic_score, 1),
        "resume_skill_count": len(resume_skills),
        "jd_required_count": len(jd_required),
    }


# ── Certifications scorer ──────────────────────────────────────────────────

def score_certifications(
    resume_certs: list[str],
    jd_requirements: dict,
) -> tuple[float, str, dict]:
    """
    Score: 0-100.
    - Required certs present: full score.
    - Preferred/general certs: bonus scoring.
    - No certs but JD doesn't require any: neutral baseline.
    """
    required_certs = jd_requirements.get("required_certifications", [])
    jd_description = jd_requirements.get("description", "")

    if not required_certs:
        if not resume_certs:
            return 50.0, "JD lists no required certifications; no certs on resume.", {"required_met": None}
        # Bonus for having certs even when not required
        bonus = min(100.0, 50 + len(resume_certs) * 10)
        return round(bonus, 1), f"JD lists no required certifications; {len(resume_certs)} cert(s) found on resume as bonus.", {"required_met": None}

    if not resume_certs:
        return 0.0, f"JD requires certifications ({', '.join(required_certs[:3])}), but none found on resume.", {"required_met": 0, "total_required": len(required_certs)}

    # Check how many required certs are on the resume
    resume_certs_lower = [c.lower() for c in resume_certs]
    met = 0
    for req in required_certs:
        req_lower = req.lower()
        if any(req_lower in rc or rc in req_lower for rc in resume_certs_lower):
            met += 1

    # Semantic similarity as secondary signal
    semantic = _embed_similarity(resume_certs, required_certs) * 100
    coverage_score = (met / len(required_certs)) * 100
    total = 0.70 * coverage_score + 0.30 * semantic

    explanation = (
        f"Met {met}/{len(required_certs)} required certification(s). "
        f"Semantic cert match: {semantic:.0f}/100."
    )
    return round(total, 1), explanation, {
        "required_met": met,
        "total_required": len(required_certs),
        "semantic_score": semantic,
    }


# ── Extras scorer ──────────────────────────────────────────────────────────

def score_extras(
    parsed_resume: dict,
    jd_requirements: dict,
) -> tuple[float, str, dict]:
    """
    Score: 0-100.
    Signals: GitHub/portfolio links, publications, multilingual, volunteer work.
    """
    points = 0
    reasons: list[str] = []

    github = parsed_resume.get("github", "")
    website = parsed_resume.get("website", "")
    extras = parsed_resume.get("extras", {})
    summary = parsed_resume.get("summary", "")

    if github:
        points += 30
        reasons.append("GitHub profile present (+30)")
    if website:
        points += 20
        reasons.append("Portfolio/website present (+20)")
    if summary and len(summary) > 80:
        points += 15
        reasons.append("Professional summary present (+15)")
    pubs = extras.get("publications", [])
    if pubs:
        points += min(20, len(pubs) * 10)
        reasons.append(f"{len(pubs)} publication(s) (+{min(20, len(pubs)*10)})")
    langs = extras.get("languages", [])
    if len(langs) > 1:
        points += 10
        reasons.append(f"Multilingual: {len(langs)} languages (+10)")
    awards = extras.get("awards", [])
    if awards:
        points += min(15, len(awards) * 5)
        reasons.append(f"{len(awards)} award(s) (+{min(15, len(awards)*5)})")

    total = min(100.0, float(points))
    explanation = "; ".join(reasons) if reasons else "No notable extras found."
    return round(total, 1), explanation, {"points": points, "breakdown": reasons}


# ── Anti-gaming check ──────────────────────────────────────────────────────

def check_skill_stuffing(parsed_resume: dict) -> list[str]:
    """
    Flag if resume lists skills that never appear in any experience/project description.
    This is a keyword-stuffing signal, not an auto-reject.
    Returns list of warning strings (empty if clean).
    """
    skills = [s.lower() for s in parsed_resume.get("skills", [])]
    if not skills:
        return []

    # Build corpus of all descriptive text
    corpus_parts: list[str] = []
    for exp in parsed_resume.get("experience", []):
        corpus_parts.append(exp.get("description", "").lower())
        corpus_parts.extend(s.lower() for s in exp.get("skills_mentioned", []))
    for proj in parsed_resume.get("projects", []):
        corpus_parts.append(proj.get("description", "").lower())
        corpus_parts.extend(s.lower() for s in proj.get("skills", []))

    corpus = " ".join(corpus_parts)

    orphaned = []
    for skill in skills:
        # Allow partial matches (e.g. "ml" inside "machine learning")
        if skill and skill not in corpus and not any(
            skill in part or part in skill for part in corpus.split()
        ):
            orphaned.append(skill)

    if len(orphaned) > 3 and (len(orphaned) / len(skills)) > 0.4:
        sample = ", ".join(orphaned[:5])
        return [
            f"Possible skill-stuffing: {len(orphaned)} skill(s) not mentioned in any experience or project "
            f"(e.g. {sample}{'...' if len(orphaned) > 5 else ''}). Verify with candidate."
        ]
    return []


# ── Timeline plausibility check ────────────────────────────────────────────

def check_timeline_plausibility(experience_entries: list[dict]) -> list[str]:
    """
    Flag overlapping full-time roles or suspicious durations.
    Returns list of warning strings.
    """
    warnings: list[str] = []

    try:
        from dateutil import parser as dparser
        from datetime import datetime

        intervals: list[tuple[datetime, datetime, str]] = []
        for entry in experience_entries:
            if not entry.get("start_date"):
                continue
            try:
                start = dparser.parse(entry["start_date"], default=datetime(2000, 1, 1))
                end_raw = entry.get("end_date", "")
                if entry.get("is_current") or not end_raw or end_raw.lower() in ("present", "current"):
                    end = datetime.now()
                else:
                    end = dparser.parse(end_raw, default=datetime(2000, 1, 1))

                if end < start:
                    warnings.append(f"Role '{entry.get('title','')}' at '{entry.get('company','')}': end date is before start date.")
                    continue

                if start.year > datetime.now().year:
                    warnings.append(f"Role '{entry.get('title','')}': start date is in the future.")

                intervals.append((start, end, f"{entry.get('title','')} @ {entry.get('company','')}"))
            except Exception:
                pass

        # Check for overlaps > 3 months (heuristic for duplicate full-time entries)
        for i in range(len(intervals)):
            for j in range(i + 1, len(intervals)):
                s1, e1, l1 = intervals[i]
                s2, e2, l2 = intervals[j]
                overlap_start = max(s1, s2)
                overlap_end = min(e1, e2)
                if overlap_start < overlap_end:
                    overlap_months = (overlap_end.year - overlap_start.year) * 12 + (overlap_end.month - overlap_start.month)
                    if overlap_months > 3:
                        warnings.append(
                            f"Timeline overlap ({overlap_months} months) between '{l1}' and '{l2}'. "
                            "May indicate concurrent roles — verify with candidate."
                        )
    except ImportError:
        logger.warning("python-dateutil not available; timeline check skipped.")

    return warnings


# ── Main entry point ───────────────────────────────────────────────────────

def score_resume(
    parsed_resume: dict,
    jd_requirements: dict,
    weights: dict | None = None,
) -> dict[str, Any]:
    """
    Compute a full candidate score against a JD.

    Args:
        parsed_resume: dict matching ParsedResume schema
        jd_requirements: dict matching JDRequirements schema
        weights: dict with keys matching DEFAULT_WEIGHTS (must sum to ~1.0)
                 If None, DEFAULT_WEIGHTS is used.

    Returns:
        {
            "total_score": float,   # 0-100
            "breakdown": {          # per-factor FactorScore dicts
                "education": {...},
                "experience": {...},
                "projects": {...},
                "skills": {...},
                "certifications": {...},
                "extras": {...},
            },
            "warnings": [str],       # anti-gaming / timeline flags
            "plain_summary": str,    # human-readable one-liner
        }
    """
    w = {**DEFAULT_WEIGHTS, **(weights or {})}

    # Validate weights sum (tolerant — allow slight float imprecision)
    total_weight = sum(w.values())
    if abs(total_weight - 1.0) > 0.02:
        raise ValueError(f"Weights must sum to 1.0, got {total_weight:.4f}")

    # Run each scorer
    edu_score, edu_expl, edu_det = score_education(
        parsed_resume.get("education", []), jd_requirements
    )
    exp_score, exp_expl, exp_det = score_experience(
        parsed_resume.get("experience", []), jd_requirements
    )
    proj_score, proj_expl, proj_det = score_projects(
        parsed_resume.get("projects", []), jd_requirements
    )
    skill_score, skill_expl, skill_det = score_skills(
        parsed_resume.get("skills", []), jd_requirements
    )
    cert_score, cert_expl, cert_det = score_certifications(
        parsed_resume.get("certifications", []), jd_requirements
    )
    extras_score, extras_expl, extras_det = score_extras(
        parsed_resume, jd_requirements
    )

    breakdown = {
        "education":      {"score": edu_score,    "weight": w["education"],      "weighted": round(edu_score * w["education"], 2),      "explanation": edu_expl,    "details": edu_det},
        "experience":     {"score": exp_score,    "weight": w["experience"],     "weighted": round(exp_score * w["experience"], 2),     "explanation": exp_expl,    "details": exp_det},
        "projects":       {"score": proj_score,   "weight": w["projects"],       "weighted": round(proj_score * w["projects"], 2),      "explanation": proj_expl,   "details": proj_det},
        "skills":         {"score": skill_score,  "weight": w["skills"],         "weighted": round(skill_score * w["skills"], 2),       "explanation": skill_expl,  "details": skill_det},
        "certifications": {"score": cert_score,   "weight": w["certifications"], "weighted": round(cert_score * w["certifications"], 2),"explanation": cert_expl,   "details": cert_det},
        "extras":         {"score": extras_score, "weight": w["extras"],         "weighted": round(extras_score * w["extras"], 2),      "explanation": extras_expl, "details": extras_det},
    }

    total = sum(v["weighted"] for v in breakdown.values())

    # Integrity checks
    warnings = []
    warnings.extend(check_skill_stuffing(parsed_resume))
    warnings.extend(check_timeline_plausibility(parsed_resume.get("experience", [])))

    # Build a human-readable summary
    sorted_factors = sorted(breakdown.items(), key=lambda x: x[1]["score"], reverse=True)
    best_factor = sorted_factors[0][0].capitalize() if sorted_factors else ""
    worst_factor = sorted_factors[-1][0].capitalize() if sorted_factors else ""
    plain_summary = (
        f"Scored {total:.0f}/100. "
        f"Strongest: {best_factor} ({sorted_factors[0][1]['score']:.0f}). "
        f"Weakest: {worst_factor} ({sorted_factors[-1][1]['score']:.0f}). "
    )
    # Add specific hints for the weakest factor
    worst_expl = sorted_factors[-1][1]["explanation"] if sorted_factors else ""
    if worst_expl:
        plain_summary += f"Note on {worst_factor}: {worst_expl}"

    return {
        "total_score": round(total, 1),
        "breakdown": breakdown,
        "warnings": warnings,
        "plain_summary": plain_summary,
    }
