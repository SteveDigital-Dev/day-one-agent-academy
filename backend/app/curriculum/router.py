from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.models import User
from app.auth.router import get_current_user
from app.curriculum.schemas import (
    SubjectResponse,
    ConceptCreate,
    ConceptResponse,
    LessonCreate,
    LessonResponse,
)
from app.curriculum.service import (
    get_subjects,
    get_subject_by_id,
    get_concepts_by_subject,
    get_concept_path,
    create_concept,
    get_lessons_by_concept,
    create_lesson,
)

router = APIRouter()


@router.get("/subjects", response_model=list[SubjectResponse])
async def list_subjects(db: AsyncSession = Depends(get_db)):
    return await get_subjects(db)


@router.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: str, db: AsyncSession = Depends(get_db)):
    subject = await get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404)
    return subject


@router.get("/subjects/{subject_id}/concepts", response_model=list[ConceptResponse])
async def list_concepts(subject_id: str, db: AsyncSession = Depends(get_db)):
    return await get_concepts_by_subject(db, subject_id)


@router.get("/concepts/{concept_id}/path", response_model=list[ConceptResponse])
async def get_prerequisite_path(
    concept_id: str, db: AsyncSession = Depends(get_db)
):
    return await get_concept_path(db, concept_id)


@router.post("/concepts", response_model=ConceptResponse, status_code=201)
async def create_concept_endpoint(
    body: ConceptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_concept(db, body.model_dump())


@router.get("/concepts/{concept_id}/lessons", response_model=list[LessonResponse])
async def list_lessons(concept_id: str, db: AsyncSession = Depends(get_db)):
    return await get_lessons_by_concept(db, concept_id)


@router.post("/lessons", response_model=LessonResponse, status_code=201)
async def create_lesson_endpoint(
    body: LessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Parents and admins only")
    return await create_lesson(db, body.model_dump())
