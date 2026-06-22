import uuid
from datetime import date, datetime

from sqlalchemy import String, Date, DateTime, ForeignKey, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Family(Base):
    __tablename__ = "families"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("users.id"), nullable=False
    )
    family_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(), ForeignKey("families.id"), nullable=True
    )
    grade_level: Mapped[str] = mapped_column(String(10), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    nyc_student_id: Mapped[str | None] = mapped_column(String(20), nullable=True)

    user = relationship("User", lazy="selectin")

    @property
    def full_name(self) -> str:
        return self.user.full_name
