import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.models import User
from app.auth.router import get_current_user
from app.users.models import Student
from app.users.service import get_student_by_id
from app.compliance.schemas import (
    HourLogEntry,
    HourLogResponse,
    HourSummary,
    IHIPCreate,
    IHIPResponse,
    QuarterlyReportCreate,
    QuarterlyReportResponse,
    AnnualAssessmentCreate,
    AnnualAssessmentResponse,
    ComplianceStatus,
)
from app.compliance.service import (
    current_school_year,
    log_hours,
    get_hour_summary,
    create_ihip,
    submit_ihip,
    get_ihip,
    create_quarterly_report,
    get_quarterly_reports,
    create_assessment,
    get_assessment,
    get_compliance_status,
)
from app.compliance.generator import (
    render_ihip,
    render_quarterly_report,
    render_annual_assessment,
)

router = APIRouter()


async def _resolve_student(
    current_user: User, db: AsyncSession, student_id: str | None = None
) -> Student:
    if current_user.role == "parent":
        if not student_id:
            raise HTTPException(status_code=400, detail="student_id required for parent")
        student = await get_student_by_id(db, student_id)
        if not student:
            raise HTTPException(status_code=404)
        if student.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized for this student")
        return student
    if current_user.role == "student":
        student = await get_student_by_id(db, str(current_user.id))
        if not student:
            raise HTTPException(status_code=404)
        return student
    raise HTTPException(status_code=403)


async def _resolve_owned_document(current_user: User, db: AsyncSession, doc_id: str):
    """Fetch a ComplianceDocument by id and verify current_user owns the student it belongs to."""
    from app.compliance.models import ComplianceDocument
    from sqlalchemy import select

    result = await db.execute(
        select(ComplianceDocument).where(ComplianceDocument.id == uuid.UUID(doc_id))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404)
    if current_user.role != "admin":
        student = await get_student_by_id(db, str(doc.student_id))
        if not student or student.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized for this document")
    return doc


# --- Hour Tracking ---


@router.post("/hours", response_model=HourLogResponse)
async def log_hours_endpoint(
    body: HourLogEntry,
    student_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    return await log_hours(db, str(student.id), body.model_dump())


@router.get("/hours/summary", response_model=HourSummary)
async def hour_summary(
    student_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    return await get_hour_summary(db, str(student.id), sy, student.grade_level)


# --- IHIP ---


@router.post("/ihip", response_model=IHIPResponse)
async def create_ihip_endpoint(
    body: IHIPCreate,
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    doc = await create_ihip(db, str(student.id), sy, body.model_dump())
    return doc


@router.post("/ihip/{doc_id}/submit", response_model=IHIPResponse)
async def submit_ihip_endpoint(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _resolve_owned_document(current_user, db, doc_id)
    doc = await submit_ihip(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404)
    return doc


@router.get("/ihip", response_model=IHIPResponse | None)
async def get_ihip_endpoint(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    doc = await get_ihip(db, str(student.id), sy)
    if not doc:
        raise HTTPException(status_code=404)
    return doc


@router.post("/ihip/{doc_id}/generate")
async def generate_ihip_pdf(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await _resolve_owned_document(current_user, db, doc_id)
    student = await get_student_by_id(db, str(doc.student_id))

    content = doc.content or {}
    path = render_ihip(
        student_name=student.full_name if student else "unknown",
        grade_level=student.grade_level if student else "unknown",
        school_year=doc.school_year,
        curriculum_materials=content.get("curriculum_materials", {}),
        quarterly_dates=content.get("quarterly_report_dates", []),
        instructors=content.get("instructors", []),
        parent_name=student.user.full_name if student and student.user else current_user.full_name,
    )
    return {"path": path, "status": "generated"}


# --- Quarterly Reports ---


@router.post("/quarterly-reports", response_model=QuarterlyReportResponse)
async def create_quarterly_report_endpoint(
    body: QuarterlyReportCreate,
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    doc = await create_quarterly_report(
        db, str(student.id), sy, body.model_dump()
    )
    return doc


@router.get("/quarterly-reports", response_model=list[QuarterlyReportResponse])
async def list_quarterly_reports(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    return await get_quarterly_reports(db, str(student.id), sy)


# --- Annual Assessment ---


@router.post("/assessments", response_model=AnnualAssessmentResponse)
async def create_assessment_endpoint(
    body: AnnualAssessmentCreate,
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    assessment = await create_assessment(
        db, str(student.id), sy, body.model_dump()
    )
    return assessment


@router.get("/assessments", response_model=AnnualAssessmentResponse | None)
async def get_assessment_endpoint(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    sy = current_school_year()
    assessment = await get_assessment(db, str(student.id), sy)
    if not assessment:
        raise HTTPException(status_code=404)
    return assessment


# --- Dashboard ---


@router.get("/status", response_model=ComplianceStatus)
async def compliance_status(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    return await get_compliance_status(
        db, str(student.id), student.grade_level
    )
