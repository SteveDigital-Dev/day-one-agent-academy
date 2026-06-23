from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.auth.router import get_current_user
from app.database import get_db
from app.ai.service import tutor_chat, generate_quiz, explain_concept, generate_lesson_quiz
from app.curriculum.service import get_lesson_by_id

router = APIRouter()


class TutorRequest(BaseModel):
    question: str
    grade_level: str = "8"
    context: str | None = None


class QuizRequest(BaseModel):
    subject: str
    topic: str
    grade_level: str = "8"
    count: int = 5


class ExplainRequest(BaseModel):
    concept: str
    grade_level: str = "8"


@router.post("/tutor/chat")
async def tutor_endpoint(
    body: TutorRequest,
    current_user: User = Depends(get_current_user),
):
    response = await tutor_chat(
        question=body.question,
        grade_level=body.grade_level,
        context=body.context,
    )
    return {"response": response}


@router.post("/tutor/quiz")
async def quiz_endpoint(
    body: QuizRequest,
    current_user: User = Depends(get_current_user),
):
    response = await generate_quiz(
        subject=body.subject,
        topic=body.topic,
        grade_level=body.grade_level,
        count=body.count,
    )
    return {"quiz": response}


@router.post("/tutor/explain")
async def explain_endpoint(
    body: ExplainRequest,
    current_user: User = Depends(get_current_user),
):
    response = await explain_concept(
        concept=body.concept,
        grade_level=body.grade_level,
    )
    return {"explanation": response}


@router.get("/lesson/{lesson_id}/quiz")
async def lesson_quiz_endpoint(
    lesson_id: str,
    count: int = 5,
    grade_level: str = "6",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = await get_lesson_by_id(db, lesson_id)
    if not lesson or not lesson.content:
        raise HTTPException(status_code=404, detail="Lesson not found or has no content")
    try:
        questions = await generate_lesson_quiz(lesson.content, grade_level, count)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")
    return {"questions": questions}


@router.get("/provider")
async def current_provider():
    from app.config import settings
    return {"provider": settings.ai_provider}
