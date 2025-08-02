from sqlalchemy.orm import Session
from app.models import Job, JobStatus
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from fastapi import HTTPException
import os

class SubmissionService:
    def __init__(self):
        # Configure Circuit Breaker with retries
        self.session = requests.Session()
        retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[502, 503, 504])
        self.session.mount("http://", HTTPAdapter(max_retries=retries))
        self.analysis_url = os.getenv("ANALYSIS_SERVICE_URL")

    def submit_text(self, db: Session, text: str) -> dict:
        job = Job(text=text, status=JobStatus.PENDIENTE)
        db.add(job)
        db.commit()
        db.refresh(job)
        
        try:
            response = self.session.post(self.analysis_url, json={"jobId": job.id}, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            db.delete(job)
            db.commit()
            raise HTTPException(status_code=500, detail=f"Fallo al iniciar el análisis: {str(e)}")
        
        return {
            "jobId": job.id,
            "status": job.status,
            "sentiment": job.sentiment,
            "keywords": job.keywords
        }

    def get_job(self, db: Session, job_id: str) -> Job:
        return db.query(Job).filter(Job.id == job_id).first()