# app/api/v1/hr/job.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.connection import get_db
from app.api.v1.hr.schemas import JobCreate
from app.services.job_service import create_job, get_active_jobs


# ----------------------------------------------------------------------
# DO NOT set prefix here – it is added in main.py as "/api/v1/hr/jobs"
# ----------------------------------------------------------------------
router = APIRouter()   # ← This is imported as `hr_job_router` in main.py


@router.post("/", status_code=201)
def add_job(job: JobCreate, db: Session = Depends(get_db)):
    """
    Create a new job posting.
    """
    try:
        job_id = create_job(db, job)
        return {"message": "Job created successfully", "job_id": job_id}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/", response_model=dict)
def list_active_jobs(db: Session = Depends(get_db)):
    """
    Retrieve all active job postings.
    Returns: {"active_jobs": [...]}
    """
    try:
        jobs = get_active_jobs(db)
        if not jobs:
            raise HTTPException(status_code=404, detail="No active jobs found")
        return {"active_jobs": jobs}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching active jobs: {str(exc)}"
        ) from exc