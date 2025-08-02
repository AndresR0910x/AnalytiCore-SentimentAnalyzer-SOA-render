from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Job, JobStatus
import os
from dotenv import load_dotenv

def test_db_connection():
    # Load environment variables from .env file (for local testing)
    load_dotenv()

    # Database configuration
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL, echo=True)  # echo=True for debugging
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        # Create tables
        Base.metadata.create_all(bind=engine)
        print("Tabla 'jobs' creada o verificada con éxito.")

        # Create a test job
        db = SessionLocal()
        try:
            test_job = Job(
                text="Este es un texto de prueba",
                status=JobStatus.PENDIENTE
            )
            db.add(test_job)
            db.commit()
            print(f"Registro de prueba insertado con ID: {test_job.id}")

            # Query the test job
            job = db.query(Job).filter(Job.id == test_job.id).first()
            if job:
                print(f"Registro recuperado: ID={job.id}, Text={job.text}, Status={job.status}")
            else:
                print("Error: No se pudo recuperar el registro de prueba.")
        finally:
            db.close()
        
        print("Conexión a la base de datos Neon exitosa.")
    
    except Exception as e:
        print(f"Error al conectar con la base de datos: {str(e)}")

if __name__ == "__main__":
    test_db_connection()