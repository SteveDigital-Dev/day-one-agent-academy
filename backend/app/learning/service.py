import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.learning.models import LessonProgress, QuizAttempt


async def get_or_create_progress(
    db: AsyncSession, student_id: str, lesson_id: str
) -> LessonProgress:
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.student_id == uuid.UUID(student_id),
            LessonProgress.lesson_id == uuid.UUID(lesson_id),
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        progress = LessonProgress(
            student_id=uuid.UUID(student_id),
            lesson_id=uuid.UUID(lesson_id),
            status="not_started",
        )
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
    return progress


async def update_progress(
    db: AsyncSession, student_id: str, lesson_id: str, status: str
) -> LessonProgress | None:
    progress = await get_or_create_progress(db, student_id, lesson_id)
    if status == "in_progress" and not progress.started_at:
        progress.started_at = datetime.now(timezone.utc)
    if status == "completed":
        progress.completed_at = datetime.now(timezone.utc)
    progress.status = status
    await db.commit()
    await db.refresh(progress)
    return progress


async def get_student_progress(
    db: AsyncSession, student_id: str
) -> list[LessonProgress]:
    result = await db.execute(
        select(LessonProgress)
        .where(LessonProgress.student_id == uuid.UUID(student_id))
        .order_by(LessonProgress.created_at.desc())
    )
    return list(result.scalars().all())


async def submit_quiz(
    db: AsyncSession, student_id: str, data: dict
) -> QuizAttempt:
    attempt = QuizAttempt(
        student_id=uuid.UUID(student_id),
        concept_id=uuid.UUID(data["concept_id"]),
        score=data["score"],
        max_score=data["max_score"],
        answers=data.get("answers"),
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt


async def get_quiz_history(
    db: AsyncSession, student_id: str, concept_id: str | None = None
) -> list[QuizAttempt]:
    query = select(QuizAttempt).where(
        QuizAttempt.student_id == uuid.UUID(student_id)
    )
    if concept_id:
        query = query.where(
            QuizAttempt.concept_id == uuid.UUID(concept_id)
        )
    result = await db.execute(query.order_by(QuizAttempt.attempted_at.desc()))
    return list(result.scalars().all())


async def get_mastery(
    db: AsyncSession, student_id: str, concept_id: str
) -> float:
    """Calculate mastery as best quiz score / max_score."""
    attempts = await get_quiz_history(db, student_id, concept_id)
    if not attempts:
        return 0.0
    return max(a.score / a.max_score for a in attempts)
