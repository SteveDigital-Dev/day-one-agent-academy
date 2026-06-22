import uuid
from datetime import datetime

from pydantic import BaseModel


class ProgressUpdate(BaseModel):
    status: str = "in_progress"


class ProgressResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    lesson_id: uuid.UUID
    status: str
    score: float | None = None
    mastery_level: float | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class QuizSubmit(BaseModel):
    concept_id: str
    score: float
    max_score: float
    answers: str | None = None


class QuizResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    concept_id: uuid.UUID
    score: float
    max_score: float
    percentage: float
    attempted_at: datetime

    model_config = {"from_attributes": True}
