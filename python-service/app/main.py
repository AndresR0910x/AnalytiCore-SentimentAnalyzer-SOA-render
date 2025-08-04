from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from .services import SubmissionService  # Importación relativa
from .models import Job, JobStatus        # Importación relativa
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Lista de orígenes permitidos
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "https://frontend-latest-9780.onrender.com"
]

def add_cors_headers(response, origin):
    """Agregar headers CORS a una respuesta"""
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
        response.headers["Access-Control-Max-Age"] = "86400"
    return response

# Middleware global para CORS
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Manejar peticiones OPTIONS específicamente
    if request.method == "OPTIONS":
        response = JSONResponse({"message": "OK"})
        return add_cors_headers(response, origin)
    
    # Procesar petición normal
    response = await call_next(request)
    
    # Agregar headers CORS a todas las respuestas
    return add_cors_headers(response, origin)

# ENDPOINTS EXPLÍCITOS PARA OPTIONS
@app.options("/submit")
async def options_submit(request: Request):
    origin = request.headers.get("origin")
    response = JSONResponse({"message": "OK"})
    return add_cors_headers(response, origin)

@app.options("/job/{job_id}")
async def options_job(job_id: str, request: Request):
    origin = request.headers.get("origin")
    response = JSONResponse({"message": "OK"})
    return add_cors_headers(response, origin)

@app.options("/health")
async def options_health(request: Request):
    origin = request.headers.get("origin")
    response = JSONResponse({"message": "OK"})
    return add_cors_headers(response, origin)

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
    print(f"Received submission: {submission.text[:50]}...")
    
    if not submission.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    db = SessionLocal()
    try:
        job_response = submission_service.submit_text(db, submission.text)
        print(f"Created job: {job_response.jobId}")
        return job_response
    finally:
        db.close()

@app.get("/job/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str):
    print(f"Getting status for job: {job_id}")
    
    db = SessionLocal()
    try:
        job = submission_service.get_job(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        response = JobResponse(
            jobId=job.id,
            status=job.status,
            sentiment=job.sentiment,
            keywords=job.keywords
        )
        print(f"Job {job_id} status: {response.status}")
        return response
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "submission-service", "cors": "enabled"}

# Endpoint de debug para verificar CORS
@app.get("/debug/cors")
def debug_cors(request: Request):
    return {
        "origin": request.headers.get("origin"),
        "allowed_origins": ALLOWED_ORIGINS,
        "user_agent": request.headers.get("user-agent"),
        "method": request.method,
        "headers": dict(request.headers)
    }