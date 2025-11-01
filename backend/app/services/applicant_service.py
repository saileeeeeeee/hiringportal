import shutil
import os
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from .aishortlist import evaluate_resume_match  # Ensure this import is correct
from typing import List
from fastapi import HTTPException, Depends
from app.db.connection import get_db

# Setup logging configuration
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all levels of logs
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]  # Logs will be printed to console
)

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_resume(file, applicant_id: int):
    """Function to save resume file to the disk."""
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{applicant_id}_{file.filename}")
        logging.info(f"Saving resume for applicant {applicant_id} to {file_path}")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)  # Corrected typo here
        
        logging.info(f"Resume saved successfully for applicant {applicant_id} at {file_path}")
        return file_path
    except Exception as e:
        logging.error(f"Error while saving resume for applicant {applicant_id}: {e}")
        raise  # Re-raise the exception after logging

def create_applicant(db: Session, applicant_data: dict, resume_file, job_id: int, source: str, application_status: str, assigned_hr: str = None, assigned_manager: str = None, comments: str = None):
    """Function to create an applicant, save their resume, and create an application entry in the applications table."""
    try:
        # Generate current timestamp for created_at and updated_at
        now = datetime.now()
        
        # Prepare applicant data with default resume_url as None and timestamp
        params = {**applicant_data, "resume_url": None, "created_at": now, "updated_at": now}
        
        # Log applicant data being inserted
        logging.info(f"Inserting applicant data: {applicant_data}")

        # Insert applicant data into the applicants table
        insert_query = text(""" 
            INSERT INTO applicants (
                first_name, last_name, email, phone, linkedin_url,
                experience_years, education, current_company, current_role,
                expected_ctc, notice_period_days, skills, location, resume_url, created_at, updated_at
            ) VALUES (
                :first_name, :last_name, :email, :phone, :linkedin_url,
                :experience_years, :education, :current_company, :current_role,
                :expected_ctc, :notice_period_days, :skills, :location, :resume_url, :created_at, :updated_at
            );
        """)
        
        # Execute insert query for applicant
        logging.info("Executing insert query for applicant.")
        db.execute(insert_query, params)
        
        # Fetch the last inserted applicant_id using SCOPE_IDENTITY()
        logging.info("Fetching applicant_id of the newly inserted applicant.")
        result = db.execute(text("SELECT SCOPE_IDENTITY() AS applicant_id;"))
        applicant_id = result.fetchone()[0]
        logging.info(f"Applicant ID: {applicant_id} retrieved successfully.")

        # Handle resume file if provided
        if resume_file:
            logging.info(f"Resume file found for applicant {applicant_id}, saving the file.")
            file_path = save_resume(resume_file, applicant_id)
            logging.info(f"Resume file path: {file_path}")
            
            # Update the resume URL in the database for the applicant
            logging.info(f"Updating applicant record with resume URL: {file_path}")
            db.execute(text("UPDATE applicants SET resume_url = :resume_url WHERE applicant_id = :applicant_id"),
                       {"resume_url": file_path, "applicant_id": applicant_id})

        # Insert into applications table
        application_params = {
            "applicant_id": applicant_id,
            "job_id": job_id,
            "application_status": application_status,
            "source": source,
            "assigned_hr": assigned_hr,
            "assigned_manager": assigned_manager,
            "comments": comments,
            "created_at": now,
            "updated_at": now
        }
        
        logging.info(f"Inserting application for applicant {applicant_id} and job {job_id}.")
        
        insert_application_query = text("""
            INSERT INTO applications (
                applicant_id, job_id, application_status, source, assigned_hr,
                assigned_manager, comments, created_at, updated_at
            ) VALUES (
                :applicant_id, :job_id, :application_status, :source, :assigned_hr,
                :assigned_manager, :comments, :created_at, :updated_at
            );
        """)
        
        # Insert into applications table
        db.execute(insert_application_query, application_params)
        logging.info(f"Application created for applicant {applicant_id} and job {job_id}.")

        # Commit the transaction after insert and update
        logging.info("Committing the transaction.")
        db.commit()

        # Trigger resume evaluation (passing relevant params)
        evaluation_result = trigger_evaluate_resume_match(
            resume_pdf_path=file_path,
            job_description_text=get_job_description(job_id, db),
            high_priority_keywords=get_high_priority_keywords(job_id, db),
            normal_keywords=get_normal_keywords(job_id, db),
            job_id=job_id,
            applicant_id=applicant_id,
            source=source,
            application_status=application_status,
            assigned_hr=assigned_hr,
            assigned_manager=assigned_manager,
            comments=comments,
            db=db
        )

        logging.info(f"Evaluation result: {evaluation_result}")
        return {
            "applicant_id": applicant_id,
            "resume_url": file_path,
            "evaluation_result": evaluation_result,
            **{k: v for k, v in applicant_data.items() if k != 'resume_url'}
        }
    
    except Exception as e:
        # Rollback in case of any error
        logging.error(f"Error while creating applicant and application: {e}")
        db.rollback()
        logging.debug("Transaction rolled back.")
        raise HTTPException(status_code=500, detail=f"Failed to create applicant and application: {str(e)}")

# Function to evaluate resume match (triggered after creating applicant)
def trigger_evaluate_resume_match(
    resume_pdf_path, job_description_text, high_priority_keywords, normal_keywords, 
    job_id, applicant_id, source, application_status, 
    assigned_hr=None, assigned_manager=None, comments=None, db: Session = Depends(get_db)
):
    """Evaluates a resume match against a job description and stores the results in the database."""
    try:
        # Assume `evaluate_resume_match` is defined earlier in the system as provided by you earlier.
        result = evaluate_resume_match(
            resume_pdf_path=resume_pdf_path,
            job_description_text=job_description_text,
            high_priority_keywords=high_priority_keywords,
            normal_keywords=normal_keywords,
            job_id=job_id,
            applicant_id=applicant_id,
            source=source,
            application_status=application_status,
            assigned_hr=assigned_hr,
            assigned_manager=assigned_manager,
            comments=comments,
            db=db
        )
        return result
    except Exception as e:
        logging.error(f"Failed to evaluate resume match: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during resume evaluation: {str(e)}")

# Example of helper functions to retrieve job description and keywords
def get_job_description(job_id: int, db: Session) -> str:
    """Fetch job description from database for the given job_id."""
    query = text("SELECT job_description FROM jobs WHERE job_id = :job_id")
    result = db.execute(query, {"job_id": job_id}).fetchone()
    return result[0] if result else ""

def get_high_priority_keywords(job_id: int, db: Session) -> set:
    """Fetch high priority keywords for the job."""
    query = text("SELECT keywords FROM job_keywords WHERE job_id = :job_id AND priority = 'high'")
    result = db.execute(query, {"job_id": job_id}).fetchall()
    return {row[0] for row in result}

def get_normal_keywords(job_id: int, db: Session) -> set:
    """Fetch normal keywords for the job."""
    query = text("SELECT keywords FROM job_keywords WHERE job_id = :job_id AND priority = 'normal'")
    result = db.execute(query, {"job_id": job_id}).fetchall()
    return {row[0] for row in result}



def get_all_applicants(db: Session) -> List[dict]:
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
