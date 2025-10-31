import shutil
import os
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

# Setup logging configuration
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all levels of logs
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]  # Logs will be printed to console
)

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_resume(file, applicant_id: int):
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{applicant_id}_{file.filename}")
        logging.info(f"Saving resume for applicant {applicant_id} to {file_path}")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logging.info(f"Resume saved successfully for applicant {applicant_id} at {file_path}")
        return file_path
    except Exception as e:
        logging.error(f"Error while saving resume for applicant {applicant_id}: {e}")
        raise  # Re-raise the exception after logging

def create_applicant(db: Session, applicant_data: dict, resume_file):
    try:
        now = datetime.now()
        params = {**applicant_data, "resume_url": "", "created_at": now, "updated_at": now}
        
        # Log applicant data being inserted (Sensitive data should be logged carefully)
        logging.info(f"Inserting applicant data: {applicant_data}")

        # Insert applicant data into the database
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
        
        # Execute insert query
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
            logging.info(f"Updating applicant record with resume URL: {file_path}")
            # Update the resume URL
            db.execute(text("UPDATE applicants SET resume_url = :resume_url WHERE applicant_id = :applicant_id"),
                       {"resume_url": file_path, "applicant_id": applicant_id})
        
        # Commit the transaction
        logging.info("Committing the transaction.")
        db.commit()
        logging.info(f"Applicant {applicant_id} created successfully.")
        return applicant_id
    
    except Exception as e:
        # Rollback in case of any error
        logging.error(f"Error while creating applicant: {e}")
        db.rollback()
        logging.debug("Transaction rolled back.")
        raise  # Re-raise the exception to handle it higher up
