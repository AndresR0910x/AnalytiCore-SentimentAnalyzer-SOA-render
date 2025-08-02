from sqlalchemy import Column, String, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum
import uuid


Base = declarative_base()

class JobStatus(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    PROCESADO = "PROCESADO"
    COMPLETADO = "COMPLETADO"


class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True, default= lambda: str(uuid.uuid4()))
    text = Column(String, nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.PENDIENTE)
    sentiment =Column(String)
    keywords = Column(String)


