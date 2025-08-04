from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services import SubmissionService
from app.models import Job, JobStatus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

#Clase main puerta de entrada para la app

load_dotenv()

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Añadir el origen del frontend (local y producción)
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
print(DATABASE_URL)
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