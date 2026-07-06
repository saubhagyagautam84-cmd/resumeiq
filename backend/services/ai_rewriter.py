"""
AI bullet point rewriter using the Groq API (llama-3.3-70b-versatile).

Design:
- Returns only a suggestion; frontend always requires user confirmation before inserting.
- If GROQ_API_KEY is not set, raises a clear error.
"""
from __future__ import annotations

import os
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert resume writer. Your job is to rewrite a rough bullet point into a polished,
ATS-friendly resume bullet using strong action verbs and quantified impact where plausible.

Rules:
1. Output EXACTLY ONE bullet point — no lists, no preamble, no explanation.
2. Start with a strong past-tense action verb (e.g. Led, Built, Reduced, Improved, Designed).
3. Include measurable impact if the user provided numbers; if not, make the impact clear but DO NOT invent specific numbers (use qualitative impact language instead).
4. Keep it under 20 words when possible.
5. Professional, concise, resume-appropriate tone.
6. No bullet character (•) at the start — just the text.
"""


async def rewrite_bullet(raw_text: str, context: str = "") -> tuple[str, str]:
    """
    Rewrite a raw bullet point using Groq.

    Args:
        raw_text: The user's rough description of what they did.
        context: Optional context (e.g. role title) to improve relevance.

    Returns:
        Tuple of (rewritten_text, model_id_used).

    Raises:
        RuntimeError if the API key is missing or the call fails.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not set. "
            "Add it to your .env file to enable the AI bullet rewriter. "
            "Get a free key at console.groq.com."
        )

    try:
        from groq import Groq
    except ImportError:
        raise RuntimeError("groq package is not installed. Run: pip install groq")

    user_message = raw_text.strip()
    if context:
        user_message = f"[Context: {context}]\n\n{user_message}"

    model = "llama-3.3-70b-versatile"

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=model,
            max_tokens=200,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )
        rewritten = completion.choices[0].message.content.strip()
        # Strip any accidental bullet character the model may have added
        rewritten = rewritten.lstrip("•·-– ").strip()
        return rewritten, model

    except Exception as exc:
        logger.error("Groq API call failed: %s", exc)
        raise RuntimeError(f"AI rewriter failed: {exc}") from exc
