"""Seed script: creates parent, 4 students, subjects, concepts, lessons,
hour logs, progress, quizzes, and compliance documents for the current school year."""

import asyncio
import uuid
from datetime import date, datetime, timedelta, timezone
from random import choice, randint, uniform

from sqlalchemy import select, func as sa_func

from app.database import async_session, engine, Base, init_db
from app.auth.models import User
from app.auth.service import hash_password
from app.users.models import Student, Family
from app.curriculum.models import Subject, Concept, Lesson, concept_prerequisites
from app.learning.models import LessonProgress, QuizAttempt
from app.compliance.models import ComplianceDocument, HourLog, AnnualAssessment
from app.compliance.service import current_school_year


# ─── Config ───────────────────────────────────────────────────────────────────

PARENT_EMAIL = "parent@demo.aa"
PARENT_PASSWORD = "demo1234"
PARENT_NAME = "Sarah Chen"
SCHOOL_YEAR = current_school_year()
SY_START_YEAR = int(SCHOOL_YEAR.split("-")[0])

STUDENTS = [
    {"name": "Ethan Chen", "grade": "3",  "nyc_id": "NYC-1001"},
    {"name": "Maya Chen",  "grade": "6",  "nyc_id": "NYC-1002"},
    {"name": "Liam Chen",  "grade": "8",  "nyc_id": "NYC-1003"},
    {"name": "Zara Chen",  "grade": "11", "nyc_id": "NYC-1004"},
]

# NY required subjects mapped by grade band
REQUIRED_SUBJECTS = {
    "all": [
        "Mathematics", "English Language Arts", "Science",
        "Social Studies", "Health Education", "Physical Education",
        "Music", "Visual Arts",
    ],
    "elementary": ["Reading", "Spelling", "Writing", "Geography", "US History", "NY History"],
    "secondary": ["Global History", "US Government", "Economics"],
}

QUARTER_DATES = [
    (date(SY_START_YEAR, 7, 1), date(SY_START_YEAR, 10, 15)),
    (date(SY_START_YEAR, 10, 16), date(SY_START_YEAR + 1, 1, 15)),
    (date(SY_START_YEAR + 1, 1, 16), date(SY_START_YEAR + 1, 4, 15)),
    (date(SY_START_YEAR + 1, 4, 16), date(SY_START_YEAR + 1, 6, 30)),
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def rand_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=randint(0, max(delta, 0)))


async def seed():
    await init_db()
    async with async_session() as db:
        # ── 1. Parent user ────────────────────────────────────────────────
        existing = await db.execute(select(User).where(User.email == PARENT_EMAIL))
        if existing.scalar_one_or_none():
            print("Seed data already exists — skipping.")
            return

        parent = User(
            email=PARENT_EMAIL,
            hashed_password=hash_password(PARENT_PASSWORD),
            full_name=PARENT_NAME,
            role="parent",
        )
        db.add(parent)
        await db.flush()
        print(f"✓ Created parent: {PARENT_EMAIL} / {PARENT_PASSWORD}")

        # ── 2. Family ─────────────────────────────────────────────────────
        family = Family(name="Chen Family")
        db.add(family)
        await db.flush()

        # ── 3. Students ───────────────────────────────────────────────────
        student_objs = []
        for s in STUDENTS:
            student = Student(
                user_id=parent.id,
                family_id=family.id,
                grade_level=s["grade"],
                nyc_student_id=s["nyc_id"],
            )
            db.add(student)
            await db.flush()
            student_objs.append(student)
            print(f"✓ Created student: {s['name']} (Grade {s['grade']})")

        # ── 4. Subjects ───────────────────────────────────────────────────
        all_subject_names = REQUIRED_SUBJECTS["all"] + REQUIRED_SUBJECTS["elementary"] + REQUIRED_SUBJECTS["secondary"]
        subject_order = 0
        subject_map = {}
        for name in all_subject_names:
            band = "1-12"
            if name in REQUIRED_SUBJECTS["elementary"]:
                band = "1-6"
            elif name in REQUIRED_SUBJECTS["secondary"]:
                band = "7-12"
            is_req = name not in ("Music", "Visual Arts", "Physical Education") or True
            subj = Subject(
                name=name,
                code=name.lower().replace(" ", "_").replace("&", "and"),
                grade_band=band,
                description=f"{name} instruction",
                is_required=True,
                sort_order=subject_order,
            )
            db.add(subj)
            await db.flush()
            subject_map[name] = subj
            subject_order += 1
        print(f"✓ Created {len(all_subject_names)} subjects")

        # ── 5. Concepts & Lessons ─────────────────────────────────────────
        concept_map = {}
        for subj_name, subj in subject_map.items():
            for i in range(1, 4):
                concept = Concept(
                    subject_id=subj.id,
                    name=f"{subj_name} — Unit {i}",
                    description=f"Core concepts in {subj_name}, unit {i}",
                    order_index=i,
                    mastery_threshold=0.8,
                )
                db.add(concept)
                await db.flush()
                concept_map[(subj_name, i)] = concept

                for j in range(1, 5):
                    lesson = Lesson(
                        concept_id=concept.id,
                        title=f"{subj_name} — Lesson {i}.{j}",
                        content=f"Lesson content for {subj_name} unit {i} lesson {j}.",
                        order_index=j,
                        estimated_minutes=choice([20, 25, 30, 35, 40, 45]),
                    )
                    db.add(lesson)
                await db.flush()

            link_prereqs = [
                concept_map.get((subj_name, 1)),
                concept_map.get((subj_name, 2)),
            ]
            for prereq in link_prereqs:
                if prereq:
                    stmt = concept_prerequisites.insert().values(
                        concept_id=concept_map[(subj_name, 3)].id,
                        prerequisite_id=prereq.id,
                    )
                    await db.execute(stmt)
        print("✓ Created concepts, lessons, and prerequisite links")

        # ── 6. Hour Logs & Progress per Student ──────────────────────────
        all_lessons = (await db.execute(select(Lesson))).scalars().all()
        all_concepts = (await db.execute(select(Concept))).scalars().all()

        for student in student_objs:
            # Hours
            grade_num = int(student.grade_level)
            target = 990 if grade_num >= 7 else 900
            hours_per_quarter = target // 4

            for qi, (q_start, q_end) in enumerate(QUARTER_DATES, 1):
                # Log ~80% of target hours for realistic under-coverage
                q_hours = int(hours_per_quarter * uniform(0.65, 0.95))
                logged = 0
                while logged < q_hours:
                    d = rand_date(q_start, q_end)
                    day_hours = round(uniform(0.5, 4.0), 1)
                    day_hours = min(day_hours, q_hours - logged)
                    if day_hours < 0.5:
                        break
                    # Pick a random subject
                    subj = choice(list(subject_map.values()))
                    log = HourLog(
                        student_id=student.id,
                        subject_id=subj.id,
                        log_date=d,
                        hours=day_hours,
                        description=f"{subj.name} study session",
                    )
                    db.add(log)
                    logged += day_hours

            # Lesson progress (mark ~40% completed, ~20% in-progress)
            completed_count = int(len(all_lessons) * 0.4)
            in_progress_count = int(len(all_lessons) * 0.2)
            shuffled = list(all_lessons)
            import random
            random.shuffle(shuffled)
            progress_statuses = (
                ["completed"] * completed_count
                + ["in_progress"] * in_progress_count
            )
            for lesson in shuffled[: len(progress_statuses)]:
                status = progress_statuses.pop()
                lp = LessonProgress(
                    student_id=student.id,
                    lesson_id=lesson.id,
                    status=status,
                    score=round(uniform(60, 100), 1) if status == "completed" else None,
                    mastery_level=round(uniform(0.5, 1.0), 2) if status == "completed" else None,
                    started_at=datetime.now(timezone.utc) - timedelta(days=randint(1, 90)),
                    completed_at=(
                        datetime.now(timezone.utc) - timedelta(days=randint(0, 60))
                        if status == "completed"
                        else None
                    ),
                )
                db.add(lp)

            # Quiz attempts (1-3 per concept)
            for concept in all_concepts[:10]:
                for _ in range(randint(1, 3)):
                    score = uniform(5, 10)
                    quiz = QuizAttempt(
                        student_id=student.id,
                        concept_id=concept.id,
                        score=score,
                        max_score=10,
                        answers='{"q1":"a","q2":"b","q3":"c"}',
                        attempted_at=datetime.now(timezone.utc) - timedelta(days=randint(1, 90)),
                    )
                    db.add(quiz)

        print("✓ Created hour logs, lesson progress, and quiz attempts")

        # ── 7. Compliance Documents per Student ──────────────────────────
        Q_REPORT_DATES = [
            f"{SY_START_YEAR}-11-15",
            f"{SY_START_YEAR + 1}-01-31",
            f"{SY_START_YEAR + 1}-04-15",
            f"{SY_START_YEAR + 1}-06-30",
        ]

        for student in student_objs:
            # IHIP
            subject_materials = {}
            for name in all_subject_names:
                subject_materials[name] = f"Standard {name} curriculum — grade {student.grade_level}"
            ihip = ComplianceDocument(
                student_id=student.id,
                school_year=SCHOOL_YEAR,
                document_type="ihip",
                status="submitted",
                content={
                    "curriculum_materials": subject_materials,
                    "quarterly_report_dates": Q_REPORT_DATES,
                    "instructors": [{"name": PARENT_NAME, "role": "Primary Instructor"}],
                },
                submitted_at=datetime.now(timezone.utc) - timedelta(days=300),
            )
            db.add(ihip)
            await db.flush()

            # Quarterly reports (the 4th includes annual assessment date)
            grade_num = int(student.grade_level)
            target = 990 if grade_num >= 7 else 900
            q_hours = target // 4

            for qi in range(1, 5):
                actual_hours = int(q_hours * uniform(0.7, 0.95))
                subjects_covered = {}
                narratives = {}
                for name in list(subject_materials.keys())[:8]:
                    subjects_covered[name] = f"Completed units 1-2 in {name}"
                    narratives[name] = "Satisfactory progress"

                report = ComplianceDocument(
                    student_id=student.id,
                    school_year=SCHOOL_YEAR,
                    document_type="quarterly_report",
                    status="submitted" if qi < 4 else "draft",
                    quarter_number=qi,
                    content={
                        "hours_this_quarter": actual_hours,
                        "material_covered": subjects_covered,
                        "grades_or_narrative": narratives,
                        "under_80_explanation": None,
                    },
                    submitted_at=(
                        datetime.now(timezone.utc) - timedelta(days=(4 - qi) * 60)
                        if qi < 4
                        else None
                    ),
                )
                db.add(report)

            # Annual assessment
            assessment_types = ["standardized_test", "standardized_test", "narrative", "standardized_test"]
            test_names = ["Iowa Assessments", "Stanford Achievement Test", None, "PASS Test"]
            percentiles = [52, 47, None, 63]

            assess = AnnualAssessment(
                student_id=student.id,
                school_year=SCHOOL_YEAR,
                assessment_type=assessment_types[student_objs.index(student)],
                test_name=test_names[student_objs.index(student)],
                score=round(uniform(65, 95), 1) if assessment_types[student_objs.index(student)] == "standardized_test" else None,
                percentile=percentiles[student_objs.index(student)],
                narrative="Good progress across all subjects this year. Shows particular strength in mathematics and science." if assessment_types[student_objs.index(student)] == "narrative" else None,
                meets_threshold=percentiles[student_objs.index(student)] is None or percentiles[student_objs.index(student)] >= 33,
                submitted_at=datetime.now(timezone.utc) - timedelta(days=randint(1, 30)),
            )
            db.add(assess)

        print("✓ Created compliance documents (IHIP, quarterly reports, assessments)")

        # ── Commit ───────────────────────────────────────────────────────
        await db.commit()
        print(f"\n{'='*60}")
        print(f"Seed complete! School year: {SCHOOL_YEAR}")
        print(f"Login: {PARENT_EMAIL} / {PARENT_PASSWORD}")
        print(f"{'='*60}")


def main():
    asyncio.run(seed())


if __name__ == "__main__":
    main()
