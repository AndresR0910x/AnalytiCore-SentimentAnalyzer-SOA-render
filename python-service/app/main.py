from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel
from app.services import SubmissionService
from app.models import Job, JobStatus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Orígenes permitidos
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "https://frontend-latest-9780.onrender.com"
]

# Middleware manual para CORS
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Manejar peticiones OPTIONS (preflight)
    if request.method == "OPTIONS":
        response = Response()
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
            response.headers["Access-Control-Max-Age"] = "86400"
        return response
    
    # Procesar petición normal
    response = await call_next(request)
    
    # Agregar headers CORS a la respuesta
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response

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

# Endpoint de health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "submission-service"}