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

# Configuración CORS más específica y segura
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Desarrollo local
        "http://localhost:3000",  # Por si usas otro puerto en desarrollo
        "https://frontend-latest-9780.onrender.com",  # Tu frontend en producción
        # Agrega aquí otros dominios si es necesario
    ],
    allow_credentials=True,  # Cambiar a True para permitir cookies/auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Métodos permitidos
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],  # Headers que el cliente puede acceder
    max_age=86400,  # Cache preflight por 24 horas
)

# Middleware adicional para manejar OPTIONS explícitamente
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response
    
    response = await call_next(request)
    
    # Asegurar headers CORS en todas las respuestas
    origin = request.headers.get("origin")
    if origin in [
        "http://localhost:5173",
        "http://localhost:3000", 
        "https://frontend-latest-9780.onrender.com"
    ]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
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