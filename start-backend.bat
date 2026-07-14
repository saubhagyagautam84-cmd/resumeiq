@echo off
echo Starting ResumeIQ backend on port 8001...
cd /d "%~dp0backend"
if not exist ".env" (
    copy ".env.example" ".env"
    echo Created .env from .env.example -- add your GROQ_API_KEY to enable AI bullet rewriter
)
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
