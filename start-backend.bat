@echo off
echo Starting ResumeIQ backend...
cd /d "%~dp0backend"
if not exist ".env" (
    copy ".env.example" ".env"
    echo Created .env from .env.example — add your ANTHROPIC_API_KEY to enable AI bullet rewriter
)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
