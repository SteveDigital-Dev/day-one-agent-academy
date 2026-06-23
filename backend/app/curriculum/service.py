import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.curriculum.models import Subject, Concept, Lesson, concept_prerequisites


async def get_subjects(db: AsyncSession) -> list[Subject]:
    result = await db.execute(select(Subject).order_by(Subject.sort_order))
    return list(result.scalars().all())


async def get_subject_by_id(db: AsyncSession, subject_id: str) -> Subject | None:
    result = await db.execute(
        select(Subject).where(Subject.id == uuid.UUID(subject_id))
    )
    return result.scalar_one_or_none()


async def get_concepts_by_subject(db: AsyncSession, subject_id: str) -> list[Concept]:
    result = await db.execute(
        select(Concept)
        .where(Concept.subject_id == uuid.UUID(subject_id))
        .order_by(Concept.order_index)
    )
    return list(result.scalars().all())


async def create_concept(db: AsyncSession, data: dict) -> Concept:
    prerequisite_ids = data.pop("prerequisite_ids", [])
    data["subject_id"] = uuid.UUID(data["subject_id"])
    concept = Concept(**data)
    db.add(concept)
    await db.flush()
    for pid in prerequisite_ids:
        stmt = concept_prerequisites.insert().values(
            concept_id=concept.id, prerequisite_id=uuid.UUID(pid)
        )
        await db.execute(stmt)
    await db.commit()
    await db.refresh(concept)
    return concept


async def get_concept_path(
    db: AsyncSession, concept_id: str
) -> list[Concept]:
    """Return ordered prerequisites for a concept (breadcrumb path)."""
    result = await db.execute(
        select(Concept).where(Concept.id == uuid.UUID(concept_id))
    )
    concept = result.scalar_one_or_none()
    if not concept:
        return []
    path = []
    seen = set()
    stack = [concept]
    while stack:
        c = stack.pop()
        if c.id in seen:
            continue
        seen.add(c.id)
        path.append(c)
        for prereq in c.prerequisites:
            if prereq.id not in seen:
                stack.append(prereq)
    path.reverse()
    return path


async def get_lesson_by_id(db: AsyncSession, lesson_id: str) -> Lesson | None:
    result = await db.execute(
        select(Lesson).where(Lesson.id == uuid.UUID(lesson_id))
    )
    return result.scalar_one_or_none()


async def get_all_concepts(db: AsyncSession) -> list[Concept]:
    result = await db.execute(select(Concept).order_by(Concept.order_index))
    return list(result.scalars().all())


async def get_lessons_by_concept(db: AsyncSession, concept_id: str) -> list[Lesson]:
    result = await db.execute(
        select(Lesson)
        .where(Lesson.concept_id == uuid.UUID(concept_id))
        .order_by(Lesson.order_index)
    )
    return list(result.scalars().all())


async def create_lesson(db: AsyncSession, data: dict) -> Lesson:
    data["concept_id"] = uuid.UUID(data["concept_id"])
    lesson = Lesson(**data)
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson
