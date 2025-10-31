import shutil
import os
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from sqlalchemy import text
from datetime import datetime
import shutil
import os
import logging

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)




def save_resume(file: UploadFile, applicant_id: int) -> str:
    try:
        filename = f"{applicant_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Reset file pointer to beginning
        file.file.seek(0)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not os.path.exists(file_path):
            raise Exception("File save failed: not found on disk")

        logging.info(f"Resume saved: {file_path}")
        return file_path
    except Exception as e:
        logging.error(f"Resume save failed: {e}")
        raise

def create_applicant(db: Session, applicant_data: dict, resume_file=None):
    """Create applicant and save resume if provided."""
    try:
        now = datetime.now()
        applicant_data = {
            **applicant_data,
            "resume_url": None,
            "created_at": now,
            "updated_at": now
        }

        # Use OUTPUT INSERTED to get applicant_id immediately
        insert_query = text("""
            INSERT INTO applicants (
                first_name, last_name, email, phone, linkedin_url,
                experience_years, education, current_company, current_role,
                expected_ctc, notice_period_days, skills, location,
                resume_url, created_at, updated_at
            )
            OUTPUT INSERTED.applicant_id
            VALUES (
                :first_name, :last_name, :email, :phone, :linkedin_url,
                :experience_years, :education, :current_company, :current_role,
                :expected_ctc, :notice_period_days, :skills, :location,
                :resume_url, :created_at, :updated_at
            );
        """)

        logging.info(f"Inserting applicant: {applicant_data['first_name']} {applicant_data['last_name']}")
        result = db.execute(insert_query, applicant_data)
        applicant_id_row = result.fetchone()

        if not applicant_id_row or applicant_id_row[0] is None:
            raise Exception("Failed to retrieve applicant_id from INSERT")

        applicant_id = int(applicant_id_row[0])
        logging.info(f"Applicant created with ID: {applicant_id}")

        # Save resume if provided
        resume_url = None
        if resume_file:
            try:
                resume_url = save_resume(resume_file, applicant_id)
                logging.info(f"Resume saved at: {resume_url}")

                # Update resume_url
                update_query = text("""
                    UPDATE applicants 
                    SET resume_url = :resume_url, updated_at = :updated_at 
                    WHERE applicant_id = :applicant_id
                """)
                db.execute(update_query, {
                    "resume_url": resume_url,
                    "updated_at": datetime.now(),
                    "applicant_id": applicant_id
                })
                logging.info("resume_url updated in database")
            except Exception as e:
                logging.error(f"Failed to save resume: {e}")
                # Optional: delete the file if DB update fails?
                # os.remove(resume_url)

        # Commit all changes
        db.commit()
        logging.info(f"Applicant {applicant_id} created successfully with resume: {resume_url}")

        return {
            "applicant_id": applicant_id,
            "resume_url": resume_url,
            **{k: v for k, v in applicant_data.items() if k != 'resume_url'}
        }

    except Exception as e:
        db.rollback()
        logging.error(f"Failed to create applicant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create applicant: {str(e)}")
    







def get_all_applicants(db: Session) -> list[dict]:
    """Function to fetch all applicants."""
    try:
        # Query all applicants
        query = text("SELECT * FROM applicants")
        result = db.execute(query).fetchall()

        # If no applicants are found, return an empty list
        if not result:
            return []

        # Convert query results to a list of dictionaries
        applicants = [
            {
                "applicant_id": row[0],
                "first_name": row[1],
                "last_name": row[2],
                "email": row[3],
                "phone": row[4],
                "linkedin_url": row[5],
                "resume_url": row[6],
                "experience_years": row[7],
                "education": row[8],
                "current_company": row[9],
                "current_role": row[10],
                "expected_ctc": row[11],
                "notice_period_days": row[12],
                "skills": row[13],
                "location": row[14],
                "created_at": row[15],
                "updated_at": row[16]
            }
            for row in result
        ]
        return applicants

    except Exception as e:
        # Log and raise an error if something goes wrong
        logging.error(f"Error fetching applicants: {e}")
        raise Exception(f"Error fetching applicants: {str(e)}")

# Create SQLAlchemy engine
DATABASE_URL = (
    "mssql+pyodbc://portaladminuser:UBTI%402025acp@saileedevdb.cb2y0uaqu31r.us-east-2.rds.amazonaws.com:1433/ubtihiringportal?driver=ODBC+Driver+17+for+SQL+Server"
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True, fast_executemany=True)

# Session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI
def get_db():
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        # Handle any database connection error and raise an HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Database connection error: {str(e)}"
        )
    finally:
        db.close()
