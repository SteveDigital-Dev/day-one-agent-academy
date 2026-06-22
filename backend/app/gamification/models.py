"""Phase 2: Gamification models (placeholder for future implementation)."""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Uuid, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Avatar(Base):
    __tablename__ = "avatars"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("students.id"), nullable=False, unique=True
    )
    appearance: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(nullable=True)
    icon: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rarity: Mapped[str] = mapped_column(String(20), default="common")
    unlock_condition: Mapped[str | None] = mapped_column(nullable=True)


class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("students.id"), nullable=False
    )
    achievement_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("achievements.id"), nullable=False
    )
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
