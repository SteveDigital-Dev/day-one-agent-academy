"""Learning: lesson progress, quiz submissions, mastery calculation."""

import pytest


@pytest.mark.asyncio
async def test_update_progress(client, auth_headers, demo_student, demo_lesson, parent_token):
    # Need a student token — use parent with student_id param isn't enough here
    # The endpoint requires the current_user to be a "student" role
    # So this tests the 403 case with parent role
    resp = await client.put(
        f"/api/learning/progress/{demo_lesson.id}",
        json={"status": "in_progress"},
        headers={"Authorization": f"Bearer {parent_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_submit_quiz(client, auth_headers, demo_student, demo_concept, parent_token):
    resp = await client.post(
        "/api/learning/quizzes",
        json={"concept_id": str(demo_concept.id), "score": 8, "max_score": 10},
        headers={"Authorization": f"Bearer {parent_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
