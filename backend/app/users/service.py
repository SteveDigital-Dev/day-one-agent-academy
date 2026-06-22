import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import Family, Student
from app.auth.models import User


async def create_family(db: AsyncSession, name: str) -> Family:
    family = Family(name=name)
    db.add(family)
    await db.commit()
    await db.refresh(family)
    return family


async def get_family(db: AsyncSession, family_id: str) -> Family | None:
    result = await db.execute(
        select(Family).where(Family.id == uuid.UUID(family_id))
    )
    return result.scalar_one_or_none()


async def create_student(
    db: AsyncSession,
    user_id: str,
    grade_level: str,
    nyc_student_id: str | None = None,
    family_id: str | None = None,
) -> Student:
    student = Student(
        user_id=uuid.UUID(user_id),
        grade_level=grade_level,
        nyc_student_id=nyc_student_id,
        family_id=uuid.UUID(family_id) if family_id else None,
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student


async def get_students_by_parent(
    db: AsyncSession, parent_user_id: str
) -> list[Student]:
    result = await db.execute(
        select(Student).join(User).where(User.id == uuid.UUID(parent_user_id))
    )
    return list(result.scalars().all())


async def get_student_by_id(
    db: AsyncSession, student_id: str
) -> Student | None:
    result = await db.execute(
        select(Student).where(Student.id == uuid.UUID(student_id))
    )
    return result.scalar_one_or_none()


async def get_students_by_family(
    db: AsyncSession, family_id: str
) -> list[Student]:
    result = await db.execute(
        select(Student).where(Student.family_id == uuid.UUID(family_id))
    )
    return list(result.scalars().all())
