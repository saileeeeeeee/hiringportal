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

def create_applicant(db: Session, applicant_data: dict, resume_file):
    """Function to create an applicant and save their resume if provided."""
    try:
        # Generate current timestamp for created_at and updated_at
        now = datetime.now()
        
        # Prepare applicant data with default resume_url as None and timestamp
        params = {**applicant_data, "resume_url": None, "created_at": now, "updated_at": now}
        
        # Log applicant data being inserted
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
            logging.info(f"Resume file path: {file_path}")
            
            # Update the resume URL in the database for the applicant
            logging.info(f"Updating applicant record with resume URL: {file_path}")
            db.execute(text("UPDATE applicants SET resume_url = :resume_url WHERE applicant_id = :applicant_id"),
                       {"resume_url": file_path, "applicant_id": applicant_id})

        # Commit the transaction after insert and update
        logging.info("Committing the transaction.")
        db.commit()
        logging.info(f"Applicant {applicant_id} created and resume URL updated successfully.")
        return applicant_id
    
    except Exception as e:
        # Rollback in case of any error
        logging.error(f"Error while creating applicant: {e}")
        db.rollback()
        logging.debug("Transaction rolled back.")
        raise  # Re-raise the exception to handle it higher up

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
