"""
Unit tests for the scoring engine.

Run with:  pytest backend/tests/test_scoring.py -v
All tests use plain dicts so there are no DB or HTTP dependencies.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from services.scoring_engine import (
    score_resume,
    score_education,
    score_experience,
    score_projects,
    score_skills,
    score_certifications,
    score_extras,
    check_skill_stuffing,
    check_timeline_plausibility,
    DEFAULT_WEIGHTS,
)

# ── Fixtures ───────────────────────────────────────────────────────────────

STRONG_JD = {
    "title": "Senior Machine Learning Engineer",
    "required_skills": ["Python", "TensorFlow", "AWS", "Machine Learning"],
    "preferred_skills": ["Kubernetes", "Spark"],
    "min_experience_years": 5,
    "education_level": "bachelors",
    "education_field": "Computer Science",
    "required_certifications": [],
    "description": "We need a senior ML engineer with 5+ years of experience in Python, TensorFlow, and AWS. Must have strong ML background.",
}

STRONG_RESUME = {
    "name": "Alice Chen",
    "email": "alice@example.com",
    "phone": "+1-555-0101",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/alicechen",
    "github": "github.com/alicechen",
    "website": "",
    "summary": "Senior ML engineer with 7 years of experience building production ML systems at scale using Python and TensorFlow.",
    "education": [
        {
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "institution": "Stanford University",
            "year_start": 2012,
            "year_end": 2016,
            "gpa": 3.9,
        }
    ],
    "experience": [
        {
            "title": "Senior Machine Learning Engineer",
            "company": "Google",
            "start_date": "Jan 2018",
            "end_date": "Present",
            "is_current": True,
            "duration_months": 72,
            "description": "Led development of TensorFlow-based ML pipelines. Deployed models to AWS. Managed team of 5 engineers.",
            "skills_mentioned": ["TensorFlow", "Python", "AWS"],
        },
        {
            "title": "ML Engineer",
            "company": "Startup Inc",
            "start_date": "Jun 2016",
            "end_date": "Dec 2017",
            "is_current": False,
            "duration_months": 18,
            "description": "Built Python machine learning models for customer churn prediction.",
            "skills_mentioned": ["Python", "Machine Learning"],
        },
    ],
    "projects": [
        {
            "title": "Open-source TensorFlow toolkit",
            "description": "Built a TensorFlow model evaluation toolkit used by 500+ developers on GitHub.",
            "skills": ["Python", "TensorFlow"],
            "links": ["github.com/alicechen/tf-eval"],
        }
    ],
    "skills": ["Python", "TensorFlow", "AWS", "Machine Learning", "Kubernetes", "Spark", "Docker"],
    "certifications": ["AWS Solutions Architect"],
    "extras": {
        "publications": ["Chen et al. NeurIPS 2022"],
        "awards": [],
        "languages": ["English", "Mandarin"],
        "volunteer": [],
    },
}

WEAK_RESUME = {
    "name": "Bob Smith",
    "email": "bob@example.com",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "website": "",
    "summary": "",
    "education": [
        {
            "degree": "High School",
            "field": "",
            "institution": "Local High School",
            "year_start": 2015,
            "year_end": 2019,
            "gpa": None,
        }
    ],
    "experience": [
        {
            "title": "Cashier",
            "company": "Supermarket",
            "start_date": "2019",
            "end_date": "2020",
            "is_current": False,
            "duration_months": 12,
            "description": "Handled cash transactions.",
            "skills_mentioned": [],
        }
    ],
    "projects": [],
    "skills": ["Customer Service"],
    "certifications": [],
    "extras": {},
}

NO_SKILLS_RESUME = {
    **STRONG_RESUME,
    "skills": [],
    "experience": [],
    "projects": [],
}


# ── Test 1: Strong candidate scores high ──────────────────────────────────

def test_strong_candidate_high_score():
    result = score_resume(STRONG_RESUME, STRONG_JD)
    # Threshold ~70 with embeddings; ~62 with keyword fallback (still a clear strong signal)
    assert result["total_score"] >= 62, f"Expected >= 62, got {result['total_score']}"
    assert "breakdown" in result
    assert "warnings" in result
    assert "plain_summary" in result


# ── Test 2: Weak candidate scores low ─────────────────────────────────────

def test_weak_candidate_low_score():
    result = score_resume(WEAK_RESUME, STRONG_JD)
    assert result["total_score"] <= 40, f"Expected <= 40, got {result['total_score']}"


# ── Test 3: Custom weights change the total ────────────────────────────────

def test_custom_weights_affect_score():
    default_result = score_resume(STRONG_RESUME, STRONG_JD)
    # Weight skills at 100% — should produce a different (skill-dominated) score
    skill_heavy = {
        "education": 0.0,
        "experience": 0.0,
        "projects": 0.0,
        "skills": 1.0,
        "certifications": 0.0,
        "extras": 0.0,
    }
    skill_result = score_resume(STRONG_RESUME, STRONG_JD, weights=skill_heavy)
    assert skill_result["total_score"] != default_result["total_score"]
    # Skill-only score should equal the skills factor score
    skills_factor = skill_result["breakdown"]["skills"]["score"]
    assert abs(skill_result["total_score"] - skills_factor) < 1.0


# ── Test 4: Invalid weights raise ValueError ──────────────────────────────

def test_invalid_weights_raise():
    bad_weights = {
        "education": 0.5,
        "experience": 0.5,
        "projects": 0.5,  # total = 1.5
        "skills": 0.0,
        "certifications": 0.0,
        "extras": 0.0,
    }
    with pytest.raises(ValueError, match="Weights must sum to 1.0"):
        score_resume(STRONG_RESUME, STRONG_JD, weights=bad_weights)


# ── Test 5: Missing sections give 0 on those factors ─────────────────────

def test_missing_sections_zero():
    result = score_resume(NO_SKILLS_RESUME, STRONG_JD)
    assert result["breakdown"]["skills"]["score"] == 0.0
    assert result["breakdown"]["experience"]["score"] == 0.0
    assert result["breakdown"]["projects"]["score"] == 0.0


# ── Test 6: Education level scoring ──────────────────────────────────────

def test_education_phd_vs_required_bachelors():
    phd_entry = [{"degree": "PhD Computer Science", "field": "Computer Science", "institution": "MIT", "year_end": 2020}]
    score, expl, det = score_education(phd_entry, STRONG_JD)
    # PhD (level=100) vs BS required (level=70) → level_score = 100; field exact match ��� field_score = 100
    assert score >= 85, f"PhD with matching CS field vs BS requirement should score >= 85, got {score}"

def test_education_high_school_vs_bachelors():
    hs_entry = [{"degree": "High School", "field": "", "institution": "Local HS", "year_end": 2019}]
    score, expl, det = score_education(hs_entry, STRONG_JD)
    assert score < 50, f"HS vs BS requirement should score < 50, got {score}"


# ── Test 7: Experience years calculation ─────────────────────────────────

def test_experience_adequate_years():
    exp_entries = [{"title": "ML Engineer", "company": "Corp", "duration_months": 72,
                    "description": "Python ML work", "skills_mentioned": ["Python"]}]
    score, expl, det = score_experience(exp_entries, STRONG_JD)
    assert det["total_years"] == 6.0
    assert score > 50

def test_experience_insufficient_years():
    exp_entries = [{"title": "Intern", "company": "Corp", "duration_months": 6,
                    "description": "Some work", "skills_mentioned": []}]
    score, expl, det = score_experience(exp_entries, STRONG_JD)
    assert score < 50, f"6 months vs 5 years required should be low, got {score}"


# ── Test 8: Skill stuffing detection ─────────────────────────────────────

def test_skill_stuffing_flagged():
    stuffed_resume = {
        **WEAK_RESUME,
        "skills": ["Python", "TensorFlow", "Kubernetes", "Spark", "Docker",
                   "React", "Go", "Rust", "Swift", "Machine Learning", "AWS", "Azure"],
        "experience": [{"title": "Cashier", "company": "Shop", "description": "Handled cash",
                        "skills_mentioned": [], "duration_months": 12}],
        "projects": [],
    }
    warnings = check_skill_stuffing(stuffed_resume)
    assert len(warnings) > 0, "Skill stuffing should be detected"
    assert "Possible skill-stuffing" in warnings[0]


def test_no_stuffing_for_legitimate_skills():
    warnings = check_skill_stuffing(STRONG_RESUME)
    # Strong resume has skills backed by experience — should not flag (or minimal)
    # TensorFlow, Python, AWS all appear in experience description
    assert len(warnings) == 0 or "Possible skill-stuffing" not in (warnings[0] if warnings else "")


# ── Test 9: Timeline plausibility check ──────────────────────────────────

def test_timeline_overlap_flagged():
    overlapping_exp = [
        {
            "title": "Engineer A", "company": "Corp A",
            "start_date": "Jan 2020", "end_date": "Dec 2022", "is_current": False,
        },
        {
            "title": "Engineer B", "company": "Corp B",
            "start_date": "Jun 2020", "end_date": "Jun 2022", "is_current": False,
        },
    ]
    warnings = check_timeline_plausibility(overlapping_exp)
    assert any("overlap" in w.lower() for w in warnings), f"Overlap should be flagged. Got: {warnings}"


def test_no_false_positive_on_sequential_jobs():
    sequential_exp = [
        {
            "title": "Junior Engineer", "company": "Corp A",
            "start_date": "Jan 2018", "end_date": "Dec 2019", "is_current": False,
        },
        {
            "title": "Senior Engineer", "company": "Corp B",
            "start_date": "Jan 2020", "end_date": "Present", "is_current": True,
        },
    ]
    warnings = check_timeline_plausibility(sequential_exp)
    assert not any("overlap" in w.lower() for w in warnings), f"No overlap expected. Got: {warnings}"


# ── Test 10: Score breakdown is complete ─────────────────────────────────

def test_breakdown_has_all_factors():
    result = score_resume(STRONG_RESUME, STRONG_JD)
    expected_factors = {"education", "experience", "projects", "skills", "certifications", "extras"}
    assert set(result["breakdown"].keys()) == expected_factors
    for factor, data in result["breakdown"].items():
        assert "score" in data, f"Missing 'score' in {factor}"
        assert "explanation" in data, f"Missing 'explanation' in {factor}"
        assert "weight" in data, f"Missing 'weight' in {factor}"
        assert 0 <= data["score"] <= 100, f"Score out of range for {factor}: {data['score']}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
