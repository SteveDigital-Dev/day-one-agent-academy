from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.models import User
from app.auth.router import get_current_user
from app.users.models import Student
from app.users.service import get_student_by_id
from app.learning.schemas import ProgressUpdate, ProgressResponse, QuizSubmit, QuizResponse
from app.learning.service import (
    update_progress,
    get_student_progress,
    submit_quiz,
    get_quiz_history,
    get_mastery,
)

router = APIRouter()


async def _resolve_student(
    current_user: User, db: AsyncSession, student_id: str | None = None
) -> Student:
    if current_user.role == "student":
        student = await get_student_by_id(db, str(current_user.id))
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    if current_user.role == "admin" and student_id:
        student = await get_student_by_id(db, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    if current_user.role == "parent" and student_id:
        student = await get_student_by_id(db, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        if student.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized for this student")
        return student
    raise HTTPException(status_code=403, detail="student_id required")


@router.put("/progress/{lesson_id}", response_model=ProgressResponse)
async def update_lesson_progress(
    lesson_id: str,
    body: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db)
    progress = await update_progress(
        db, str(student.id), lesson_id, body.status
    )
    if not progress:
        raise HTTPException(status_code=404)
    return progress


@router.get("/progress", response_model=list[ProgressResponse])
async def list_progress(
    student_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db, student_id)
    return await get_student_progress(db, str(student.id))


@router.post("/quizzes", response_model=QuizResponse)
async def submit_quiz_attempt(
    body: QuizSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db)
    attempt = await submit_quiz(db, str(student.id), body.model_dump())
    return {
        **{k: getattr(attempt, k) for k in ("id", "student_id", "concept_id", "score", "max_score", "attempted_at")},
        "percentage": (attempt.score / attempt.max_score * 100) if attempt.max_score > 0 else 0,
    }


@router.get("/quizzes", response_model=list[QuizResponse])
async def list_quiz_history(
    concept_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db)
    attempts = await get_quiz_history(db, str(student.id), concept_id)
    return [
        {
            **{k: getattr(a, k) for k in ("id", "student_id", "concept_id", "score", "max_score", "attempted_at")},
            "percentage": (a.score / a.max_score * 100) if a.max_score > 0 else 0,
        }
        for a in attempts
    ]


@router.get("/mastery/{concept_id}")
async def concept_mastery(
    concept_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await _resolve_student(current_user, db)
    level = await get_mastery(db, str(student.id), concept_id)
    return {"concept_id": concept_id, "mastery_level": level}
