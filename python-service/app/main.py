from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel
from app.services import SubmissionService
from app.models import Job, JobStatus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://react-frontend-latest-70au.onrender.com",
        "http://localhost:5173"  # Para pruebas locales
    ],
    allow_credentials=True,  # Habilitar credenciales
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pydantic Models
class TextSubmission(BaseModel):
    text: str

class JobResponse(BaseModel):
    jobId: str
    status: str
    sentiment: str | None
    keywords: str | None

# Initialize service
submission_service = SubmissionService()

@app.post("/submit", response_model=JobResponse)
def submit_text(submission: TextSubmission):
    if not submission.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    db = SessionLocal()
    try:
        job_response = submission_service.submit_text(db, submission.text)
        return job_response
    finally:
        db.close()

@app.get("/job/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str):
    db = SessionLocal()
    try:
        job = submission_service.get_job(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return JobResponse(
            jobId=job.id,
            status=job.status,
            sentiment=job.sentiment,
            keywords=job.keywords
        )
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "submission-service", "cors": "enabled"}