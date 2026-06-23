import uuid

from pydantic import BaseModel


class SubjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    grade_band: str
    description: str | None = None
    is_required: bool
    sort_order: int = 0

    model_config = {"from_attributes": True}


class ConceptCreate(BaseModel):
    subject_id: str
    name: str
    description: str | None = None
    order_index: int = 0
    prerequisite_ids: list[str] = []


class ConceptResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    name: str
    description: str | None = None
    order_index: int
    prerequisite_ids: list[str] = []

    model_config = {"from_attributes": True}


class LessonResponse(BaseModel):
    id: uuid.UUID
    concept_id: uuid.UUID
    title: str
    content: str | None = None
    content_type: str
    order_index: int
    estimated_minutes: int

    model_config = {"from_attributes": True}


class LessonCreate(BaseModel):
    concept_id: str
    title: str
    content: str | None = None
    content_type: str = "text"
    order_index: int = 0
    estimated_minutes: int = 30
