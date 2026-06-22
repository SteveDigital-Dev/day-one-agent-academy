import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select, func as sa_func
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.compliance.models import ComplianceDocument, HourLog, AnnualAssessment
from app.curriculum.models import Subject


def current_school_year() -> str:
    today = date.today()
    if today.month >= 7:
        return f"{today.year}-{today.year + 1}"
    return f"{today.year - 1}-{today.year}"


def grade_band_for_level(grade_level: str) -> str:
    level = grade_level.strip().lower()
    if level in ("k", "kindergarten"):
        return "k"
    g = int(level) if level.isdigit() else 0
    if 1 <= g <= 6:
        return "1-6"
    if 7 <= g <= 8:
        return "7-8"
    if 9 <= g <= 12:
        return "9-12"
    return "unknown"


def hour_target_for_grade(grade_level: str) -> int:
    band = grade_band_for_level(grade_level)
    if band == "1-6":
        return 900
    if band in ("7-8", "9-12"):
        return 990
    return 0


# --- Hour Tracking ---


async def log_hours(db: AsyncSession, student_id: str, entry: dict) -> HourLog:
    log = HourLog(
        student_id=uuid.UUID(student_id),
        subject_id=uuid.UUID(entry["subject_id"]) if entry.get("subject_id") else None,
        log_date=entry["log_date"],
        hours=entry["hours"],
        description=entry.get("description"),
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_hour_summary(
    db: AsyncSession, student_id: str, school_year: str, grade_level: str
) -> dict:
    start_month = settings.school_year_start_month
    start_year = int(school_year.split("-")[0])
    year_start = date(start_year, start_month, 1)
    year_end = date(start_year + 1, start_month - 1, 1) if start_month > 1 else date(start_year + 1, 12, 1)

    result = await db.execute(
        select(sa_func.coalesce(sa_func.sum(HourLog.hours), 0))
        .where(
            HourLog.student_id == uuid.UUID(student_id),
            HourLog.log_date >= year_start,
            HourLog.log_date <= year_end,
        )
    )
    total_hours = result.scalar() or 0.0

    days_result = await db.execute(
        select(sa_func.count(sa_func.distinct(HourLog.log_date)))
        .where(
            HourLog.student_id == uuid.UUID(student_id),
            HourLog.log_date >= year_start,
            HourLog.log_date <= year_end,
        )
    )
    days_logged = days_result.scalar() or 0

    by_subject_result = await db.execute(
        select(HourLog.subject_id, sa_func.sum(HourLog.hours))
        .where(
            HourLog.student_id == uuid.UUID(student_id),
            HourLog.log_date >= year_start,
            HourLog.log_date <= year_end,
        )
        .group_by(HourLog.subject_id)
    )
    hours_by_subject = {}
    for row in by_subject_result:
        subj_name = "unknown"
        if row[0]:
            subj = await db.get(Subject, row[0])
            if subj:
                subj_name = subj.name
        hours_by_subject[subj_name] = float(row[1])

    target = hour_target_for_grade(grade_level)
    return {
        "total_hours": total_hours,
        "target_hours": target,
        "percentage": (total_hours / target * 100) if target > 0 else 0,
        "days_logged": days_logged,
        "hours_by_subject": hours_by_subject,
    }


# --- IHIP ---


async def create_ihip(
    db: AsyncSession, student_id: str, school_year: str, data: dict
) -> ComplianceDocument:
    doc = ComplianceDocument(
        student_id=uuid.UUID(student_id),
        school_year=school_year,
        document_type="ihip",
        status="draft",
        content={
            "curriculum_materials": data.get("curriculum_materials", {}),
            "quarterly_report_dates": [str(d) for d in data.get("quarterly_report_dates", [])],
            "instructors": data.get("instructors", []),
        },
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def submit_ihip(db: AsyncSession, doc_id: str) -> ComplianceDocument | None:
    result = await db.execute(
        select(ComplianceDocument).where(
            ComplianceDocument.id == uuid.UUID(doc_id),
            ComplianceDocument.document_type == "ihip",
        )
    )
    doc = result.scalar_one_or_none()
    if doc:
        doc.status = "submitted"
        doc.submitted_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(doc)
    return doc


async def get_ihip(
    db: AsyncSession, student_id: str, school_year: str
) -> ComplianceDocument | None:
    result = await db.execute(
        select(ComplianceDocument).where(
            ComplianceDocument.student_id == uuid.UUID(student_id),
            ComplianceDocument.school_year == school_year,
            ComplianceDocument.document_type == "ihip",
        )
    )
    return result.scalar_one_or_none()


# --- Quarterly Reports ---


async def create_quarterly_report(
    db: AsyncSession, student_id: str, school_year: str, data: dict
) -> ComplianceDocument:
    doc = ComplianceDocument(
        student_id=uuid.UUID(student_id),
        school_year=school_year,
        document_type="quarterly_report",
        status="draft",
        quarter_number=data["quarter_number"],
        content={
            "hours_this_quarter": data.get("hours_this_quarter"),
            "material_covered": data.get("material_covered", {}),
            "grades_or_narrative": data.get("grades_or_narrative", {}),
            "under_80_explanation": data.get("under_80_explanation"),
        },
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def get_quarterly_reports(
    db: AsyncSession, student_id: str, school_year: str
) -> list[ComplianceDocument]:
    result = await db.execute(
        select(ComplianceDocument)
        .where(
            ComplianceDocument.student_id == uuid.UUID(student_id),
            ComplianceDocument.school_year == school_year,
            ComplianceDocument.document_type == "quarterly_report",
        )
        .order_by(ComplianceDocument.quarter_number)
    )
    return list(result.scalars().all())


# --- Annual Assessment ---


async def create_assessment(
    db: AsyncSession, student_id: str, school_year: str, data: dict
) -> AnnualAssessment:
    at = data["assessment_type"]
    meets = None
    if at == "standardized_test" and data.get("percentile") is not None:
        meets = data["percentile"] >= 33

    assessment = AnnualAssessment(
        student_id=uuid.UUID(student_id),
        school_year=school_year,
        assessment_type=at,
        test_name=data.get("test_name"),
        score=data.get("score"),
        percentile=data.get("percentile"),
        narrative=data.get("narrative"),
        meets_threshold=meets,
        probation_status=None if meets is not False else "active" if meets is False else None,
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment


async def get_assessment(
    db: AsyncSession, student_id: str, school_year: str
) -> AnnualAssessment | None:
    result = await db.execute(
        select(AnnualAssessment).where(
            AnnualAssessment.student_id == uuid.UUID(student_id),
            AnnualAssessment.school_year == school_year,
        )
    )
    return result.scalar_one_or_none()


# --- Compliance Status Dashboard ---


async def get_compliance_status(
    db: AsyncSession, student_id: str, grade_level: str
) -> dict:
    sy = current_school_year()
    target = hour_target_for_grade(grade_level)
    hours = await get_hour_summary(db, student_id, sy, grade_level)

    ihip = await get_ihip(db, student_id, sy)
    reports = await get_quarterly_reports(db, student_id, sy)
    assessment = await get_assessment(db, student_id, sy)

    default_q_dates = [
        {"quarter": 1, "due": f"{sy.split('-')[0]}-11-15"},
        {"quarter": 2, "due": f"{sy.split('-')[1]}-01-31"},
        {"quarter": 3, "due": f"{sy.split('-')[1]}-04-15"},
        {"quarter": 4, "due": f"{sy.split('-')[1]}-06-30"},
    ]

    today = date.today()
    next_deadline = None
    for q in default_q_dates:
        due = date.fromisoformat(q["due"])
        if due >= today:
            next_deadline = q
            break

    return {
        "school_year": sy,
        "loi_status": "required",
        "ihip_status": ihip.status if ihip else "not_submitted",
        "quarterly_reports": [
            {"quarter": r.quarter_number, "status": r.status, "submitted": str(r.submitted_at) if r.submitted_at else None}
            for r in reports
        ],
        "annual_assessment_status": (
            "submitted" if assessment else "pending"
        ),
        "hours_ytd": hours["total_hours"],
        "hours_target": target,
        "days_ytd": hours["days_logged"],
        "days_target": 180,
        "next_deadline": next_deadline,
        "on_track": hours["total_hours"] >= (target * 0.25 * len(reports) if reports else 0),
    }
