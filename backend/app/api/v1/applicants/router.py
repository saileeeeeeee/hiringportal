from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List 
from app.db.connection import get_db
from app.services.applicant_service import create_applicant, get_all_applicants
from app.api.v1.applicants.schemas import ApplicantCreate

router = APIRouter(prefix="/applicants", tags=["Applicants"])

@router.post("/", status_code=201)
async def add_applicant(
    job_id: int = Form(...),  # Add job_id as a required field
    source: str = Form(...),  # Add source as a required field
    application_status: str = Form(...),  # Add application_status as a required field
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    experience_years: Optional[float] = Form(None),
    education: Optional[str] = Form(None),
    current_company: Optional[str] = Form(None),
    current_role: Optional[str] = Form(None),
    expected_ctc: Optional[float] = Form(None),
    notice_period_days: Optional[int] = Form(None),
    skills: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    applicant_data = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "linkedin_url": linkedin_url,
        "experience_years": experience_years,
        "education": education,
        "current_company": current_company,
        "current_role": current_role,
        "expected_ctc": expected_ctc,
        "notice_period_days": notice_period_days,
        "skills": skills,
        "location": location,
    }

    try:
        # Pass the required job_id, source, and application_status to the service layer
        applicant_id = create_applicant(
            db, 
            applicant_data, 
            resume,
            job_id,  # Pass job_id here
            source,  # Pass source here
            application_status  # Pass application_status here
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Applicant created successfully", "applicant_id": applicant_id}

@router.get("/", response_model=List[dict])
async def get_applicants(db: Session = Depends(get_db)):
    try:
        applicants = get_all_applicants(db)
        if not applicants:
            raise HTTPException(status_code=404, detail="No applicants found")
        return applicants
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching applicants: {str(e)}")
