import uuid
from datetime import date

from pydantic import BaseModel


class FamilyCreate(BaseModel):
    name: str


class FamilyResponse(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class StudentCreate(BaseModel):
    full_name: str
    grade_level: str
    date_of_birth: date | None = None
    nyc_student_id: str | None = None


class StudentResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    grade_level: str
    nyc_student_id: str | None = None

    model_config = {"from_attributes": True}


class StudentDetail(BaseModel):
    id: uuid.UUID
    full_name: str
    grade_level: str
    date_of_birth: date | None = None
    nyc_student_id: str | None = None

    model_config = {"from_attributes": True}
