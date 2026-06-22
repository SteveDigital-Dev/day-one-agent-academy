"""Curriculum: subjects, concepts with prerequisites, lessons."""

import pytest


@pytest.mark.asyncio
async def test_list_subjects(client, demo_subject):
    resp = await client.get("/api/curriculum/subjects")
    assert resp.status_code == 200
    names = [s["name"] for s in resp.json()]
    assert "Mathematics" in names


@pytest.mark.asyncio
async def test_get_subject(client, demo_subject):
    resp = await client.get(f"/api/curriculum/subjects/{demo_subject.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Mathematics"


@pytest.mark.asyncio
async def test_list_concepts(client, auth_headers, demo_subject, demo_concept):
    resp = await client.get(
        f"/api/curriculum/subjects/{demo_subject.id}/concepts",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    names = [c["name"] for c in resp.json()]
    assert "Fractions" in names


@pytest.mark.asyncio
async def test_create_concept(client, auth_headers, demo_subject):
    resp = await client.post(
        "/api/curriculum/concepts",
        json={
            "subject_id": str(demo_subject.id),
            "name": "Algebra Basics",
            "order_index": 2,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Algebra Basics"


@pytest.mark.asyncio
async def test_list_lessons(client, demo_concept, demo_lesson):
    resp = await client.get(
        f"/api/curriculum/concepts/{demo_concept.id}/lessons"
    )
    assert resp.status_code == 200
    titles = [l["title"] for l in resp.json()]
    assert "Intro to Fractions" in titles
