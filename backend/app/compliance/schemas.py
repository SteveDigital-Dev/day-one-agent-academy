import uuid
from datetime import date, datetime

from pydantic import BaseModel


class HourLogEntry(BaseModel):
    log_date: date
    hours: float
    subject_id: str | None = None
    description: str | None = None


class HourLogResponse(BaseModel):
    id: uuid.UUID
    log_date: date
    hours: float
    subject_id: uuid.UUID | None = None
    description: str | None = None

    model_config = {"from_attributes": True}


class HourSummary(BaseModel):
    total_hours: float
    target_hours: int
    percentage: float
    days_logged: int
    hours_by_subject: dict[str, float]


class IHIPCreate(BaseModel):
    curriculum_materials: dict
    quarterly_report_dates: list[date]
    instructors: list[dict]


class IHIPResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    school_year: str
    status: str
    submitted_at: datetime | None = None
    district_response: str | None = None

    model_config = {"from_attributes": True}


class QuarterlyReportCreate(BaseModel):
    quarter_number: int
    hours_this_quarter: float
    material_covered: dict
    grades_or_narrative: dict
    under_80_explanation: str | None = None


class QuarterlyReportResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    school_year: str
    quarter_number: int
    status: str
    submitted_at: datetime | None = None
    content: dict | None = None

    model_config = {"from_attributes": True}


class AnnualAssessmentCreate(BaseModel):
    assessment_type: str
    test_name: str | None = None
    score: float | None = None
    percentile: float | None = None
    narrative: str | None = None


class AnnualAssessmentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    school_year: str
    assessment_type: str
    test_name: str | None = None
    percentile: float | None = None
    meets_threshold: bool | None = None
    probation_status: str | None = None

    model_config = {"from_attributes": True}


class ComplianceStatus(BaseModel):
    school_year: str
    loi_status: str
    ihip_status: str
    quarterly_reports: list[dict]
    annual_assessment_status: str | None = None
    hours_ytd: float
    hours_target: int
    days_ytd: int
    days_target: int
    next_deadline: dict | None = None
    on_track: bool
