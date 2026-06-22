from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.models import User
from app.auth.router import get_current_user
from app.users.models import Student
from app.users.schemas import (
    FamilyCreate,
    FamilyResponse,
    StudentCreate,
    StudentResponse,
    StudentDetail,
)
from app.users.service import (
    create_family,
    get_family,
    create_student,
    get_students_by_parent,
    get_student_by_id,
    get_students_by_family,
)

router = APIRouter()


@router.post("/families", response_model=FamilyResponse)
async def create_family_endpoint(
    body: FamilyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("parent", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parents only")
    return await create_family(db, body.name)


@router.get("/families/{family_id}", response_model=FamilyResponse)
async def get_family_endpoint(
    family_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family = await get_family(db, family_id)
    if not family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return family


@router.post("/students", response_model=StudentResponse)
async def create_student_endpoint(
    body: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("parent", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    student = await create_student(
        db,
        user_id=str(current_user.id),
        grade_level=body.grade_level,
        nyc_student_id=body.nyc_student_id,
    )
    return student


@router.get("/students", response_model=list[StudentDetail])
async def list_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "student":
        student = await get_student_by_id(db, str(current_user.id))
        return [student] if student else []
    return await get_students_by_parent(db, str(current_user.id))


@router.get("/students/{student_id}", response_model=StudentDetail)
async def get_student_endpoint(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return student


@router.get("/families/{family_id}/students", response_model=list[StudentDetail])
async def list_family_students(
    family_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_students_by_family(db, family_id)
