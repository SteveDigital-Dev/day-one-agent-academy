"""Pytest fixtures for backend tests — in-memory SQLite, async client."""

import asyncio
import uuid
from datetime import date, datetime, timezone

import bcrypt
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession

from app.database import Base, get_db
from app.main import app
from app.config import settings
from app.rate_limit import limiter
from app.auth.models import User
from app.users.models import Student, Family
from app.compliance.models import ComplianceDocument, HourLog, AnnualAssessment
from app.curriculum.models import Subject, Concept, Lesson
from app.learning.models import LessonProgress, QuizAttempt

# Most fixtures below log in fresh per test (parent_token, parent_token_2),
# so the full suite easily exceeds login/register's real rate limits within
# a single wall-clock minute. Rate limiting itself isn't what these tests
# are for - disable it here rather than let it flake the whole suite.
limiter.enabled = False

TEST_DB_URL = "sqlite+aiosqlite://"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def engine():
    eng = create_async_engine(TEST_DB_URL, echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest.fixture
async def db(engine):
    session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)()
    yield session
    await session.rollback()
    await session.close()


@pytest.fixture
async def client(db):
    async def _get_db():
        yield db
    app.dependency_overrides[get_db] = _get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def parent_user(db):
    user = User(
        email="parent@test.com",
        hashed_password=bcrypt.hashpw(b"test1234", bcrypt.gensalt()).decode(),
        full_name="Test Parent",
        role="parent",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def parent_token(client, parent_user):
    resp = await client.post("/api/auth/login", json={
        "email": "parent@test.com", "password": "test1234",
    })
    return resp.json()["access_token"]


@pytest.fixture
async def auth_headers(parent_token):
    return {"Authorization": f"Bearer {parent_token}"}


@pytest.fixture
async def demo_subject(db):
    s = Subject(name="Mathematics", code="math", grade_band="1-6", is_required=True, sort_order=1)
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s


@pytest.fixture
async def demo_concept(db, demo_subject):
    c = Concept(
        subject_id=demo_subject.id, name="Fractions",
        description="Understanding fractions", order_index=1,
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return c


@pytest.fixture
async def demo_lesson(db, demo_concept):
    l = Lesson(
        concept_id=demo_concept.id, title="Intro to Fractions",
        content="Lesson content", order_index=1, estimated_minutes=30,
    )
    db.add(l)
    await db.commit()
    await db.refresh(l)
    return l


@pytest.fixture
async def demo_student(db, parent_user):
    student = Student(
        user_id=parent_user.id, grade_level="3", nyc_student_id="NYC-TEST",
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student


# --- Second tenant, for cross-family IDOR regression tests ---


@pytest.fixture
async def parent_user_2(db):
    user = User(
        email="parent2@test.com",
        hashed_password=bcrypt.hashpw(b"test1234", bcrypt.gensalt()).decode(),
        full_name="Test Parent Two",
        role="parent",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def parent_token_2(client, parent_user_2):
    resp = await client.post("/api/auth/login", json={
        "email": "parent2@test.com", "password": "test1234",
    })
    return resp.json()["access_token"]


@pytest.fixture
async def auth_headers_2(parent_token_2):
    return {"Authorization": f"Bearer {parent_token_2}"}


@pytest.fixture
async def demo_student_2(db, parent_user_2):
    student = Student(
        user_id=parent_user_2.id, grade_level="5", nyc_student_id="NYC-TEST-2",
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student
