# app/api/v1/applicants/router.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict

from app.db.connection import get_db
from app.services.applicant_service import (
    create_applicant,          # ← manual form version
    get_all_applicants,        # ← list all
)
from app.services.bulk_applicant_service import (
    create_applicant_from_pdf, # ← PDF auto-parse version
)

# ----------------------------------------------------------------------
# IMPORTANT: the variable **must** be named `router`
# ----------------------------------------------------------------------
router = APIRouter()


# ==============================================================
# 1. MANUAL FORM – ALL FIELDS SUPPLIED
# ==============================================================
@router.post("/applicants", status_code=201)
async def add_applicant_manual(
    job_id: int = Form(...),
    source: str = Form(...),
    application_status: str = Form("pending"),

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
    db: Session = Depends(get_db),
):
    """
    Create applicant when **all data is already known**.
    """
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
        applicant_id = create_applicant(
            db=db,
            applicant_data=applicant_data,
            resume=resume,
            job_id=job_id,
            source=source,
            application_status=application_status,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"message": "Applicant created (manual)", "applicant_id": applicant_id}


# ==============================================================
# 2. PDF AUTO-PARSE – ONLY PDF + METADATA
# ==============================================================
@router.post("/applicants/pdf", status_code=201)
async def upload_pdf_resume(
    job_id: int = Form(...),
    source: str = Form(...),
    expected_ctc: Optional[float] = Form(None),
    notice_period_days: Optional[int] = Form(None),
    application_status: str = Form("pending"),
    assigned_hr: Optional[str] = Form(None),
    assigned_manager: Optional[str] = Form(None),
    comments: Optional[str] = Form(None),
    pdf_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload **one PDF** → auto-extract name, email, experience, etc.
    All fields except `job_id`, `source`, `pdf_file` are **optional**.
    """
    result = create_applicant_from_pdf(
        db=db,
        pdf_file=pdf_file,
        job_id=job_id,
        source=source,
        expected_ctc=expected_ctc,
        notice_period_days=notice_period_days,
        application_status=application_status,
        assigned_hr=assigned_hr,
        assigned_manager=assigned_manager,
        comments=comments,
    )
    return {"message": "Applicant created (PDF parsed)", **result}


# ==============================================================
# 3. LIST ALL APPLICANTS
# ==============================================================
@router.get("/applicants", response_model=List[Dict])
async def list_applicants(db: Session = Depends(get_db)):
    """
    Return **all** applicants.
    """
    applicants = get_all_applicants(db)
    if not applicants:
        raise HTTPException(status_code=404, detail="No applicants found")
    return applicants