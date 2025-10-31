from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.v1.hr.schemas import JobCreate
from datetime import datetime
from fastapi import HTTPException






    
def get_active_jobs(db: Session):
        query = text("SELECT * FROM jobs WHERE status = 'open' ")
        result = db.execute(query).fetchall()
        return [
            {
                "job_id": row[0],
                "title": row[1],
                "description": row[2],
                "location": row[3],
                "posted_at": row[4]
            }
            for row in result
        ]
    


def create_job(db: Session, job: JobCreate):
    # Check if approved_by exists in users table
    if job.approved_by:
        query = text("SELECT emp_id FROM users WHERE emp_id = :emp_id")
        user = db.execute(query, {"emp_id": job.approved_by}).fetchone()
        if not user:
            raise HTTPException(status_code=400, detail=f"User with emp_id {job.approved_by} not found.")
    
    # Insert job data into the database
    insert_query = text("""
        INSERT INTO jobs (
            created_by, title, job_code, department, location, employment_type,
            experience_required, salary_range, jd, key_skills, additional_skills,
            openings, posted_date, closing_date, status, approved_by, approved_date
        ) VALUES (
            :created_by, :title, :job_code, :department, :location, :employment_type,
            :experience_required, :salary_range, :jd, :key_skills, :additional_skills,
            :openings, :posted_date, :closing_date, :status, :approved_by, :approved_date
        )
    """)

    # Default posted_date if not provided
    posted_date = job.posted_date or datetime.now()

    try:
        # Execute the INSERT query
        db.execute(insert_query, {
            "created_by": job.created_by,
            "title": job.title,
            "job_code": job.job_code,
            "department": job.department,
            "location": job.location,
            "employment_type": job.employment_type,
            "experience_required": job.experience_required,
            "salary_range": job.salary_range,
            "jd": job.jd,
            "key_skills": job.key_skills,
            "additional_skills": job.additional_skills,
            "openings": job.openings,
            "posted_date": posted_date,
            "closing_date": job.closing_date,
            "status": job.status,
            "approved_by": job.approved_by,
            "approved_date": job.approved_date
        })
        db.commit()  # Commit the transaction after the insert

        # Return a success message or status indicating job creation
        return {"message": "Job created successfully", "status": "success"}

    except Exception as e:
        db.rollback()  # Rollback in case of error
        # Log the error for debugging purposes
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")
    
