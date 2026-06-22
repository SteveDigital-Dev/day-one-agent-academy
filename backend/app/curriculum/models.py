import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, Boolean, DateTime, ForeignKey, Table, Column, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


concept_prerequisites = Table(
    "concept_prerequisites",
    Base.metadata,
    Column("concept_id", Uuid(), ForeignKey("concepts.id"), primary_key=True),
    Column("prerequisite_id", Uuid(), ForeignKey("concepts.id"), primary_key=True),
)


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    grade_band: Mapped[str] = mapped_column(String(10), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("subjects.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    mastery_threshold: Mapped[float] = mapped_column(default=0.8)

    prerequisites = relationship(
        "Concept",
        secondary=concept_prerequisites,
        primaryjoin="Concept.id == concept_prerequisites.c.concept_id",
        secondaryjoin="Concept.id == concept_prerequisites.c.prerequisite_id",
        backref="dependent_concepts",
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    concept_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("concepts.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_type: Mapped[str] = mapped_column(String(50), default="text")
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30)
