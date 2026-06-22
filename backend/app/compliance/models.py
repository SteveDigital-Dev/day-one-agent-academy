import uuid
from datetime import date, datetime

from sqlalchemy import (
    String, Integer, Float, Boolean, Date, DateTime, ForeignKey, Text, func, JSON,
)
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ComplianceDocument(Base):
    __tablename__ = "compliance_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("students.id"), nullable=False
    )
    school_year: Mapped[str] = mapped_column(String(9), nullable=False)
    document_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default="draft"
    )
    content: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    quarter_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    district_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class HourLog(Base):
    __tablename__ = "hour_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("students.id"), nullable=False
    )
    subject_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(), ForeignKey("subjects.id"), nullable=True
    )
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    hours: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AnnualAssessment(Base):
    __tablename__ = "annual_assessments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("students.id"), nullable=False
    )
    school_year: Mapped[str] = mapped_column(String(9), nullable=False)
    assessment_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )
    test_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    percentile: Mapped[float | None] = mapped_column(Float, nullable=True)
    narrative: Mapped[str | None] = mapped_column(Text, nullable=True)
    meets_threshold: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    probation_status: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )
    remediation_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
