"""Users/families: ownership checks (cross-family IDOR regression tests).

Every test here simulates parent_user_2 trying to reach parent_user's data
via a guessed/enumerated id. Before the fix, all three endpoints returned
200 with the other family's real student/family data.
"""

import pytest

from app.users.models import Student


@pytest.mark.asyncio
async def test_get_own_student_ok(client, auth_headers, demo_student):
    resp = await client.get(f"/api/users/students/{demo_student.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == str(demo_student.id)


@pytest.mark.asyncio
async def test_cannot_get_other_parents_student(client, auth_headers_2, demo_student):
    resp = await client.get(f"/api/users/students/{demo_student.id}", headers=auth_headers_2)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_list_other_family_students(client, db, auth_headers_2, parent_user, demo_student):
    # The create-student endpoint doesn't currently expose family_id, so
    # attach one directly via the DB to exercise the family-scoped endpoint.
    demo_student.family_id = demo_student.id  # any non-null uuid works here
    db.add(demo_student)
    await db.commit()

    resp = await client.get(
        f"/api/users/families/{demo_student.family_id}/students", headers=auth_headers_2
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_get_other_family(client, auth_headers, auth_headers_2):
    create_resp = await client.post(
        "/api/users/families", json={"name": "Parent Two's Family"}, headers=auth_headers_2
    )
    family_id = create_resp.json()["id"]
    resp = await client.get(f"/api/users/families/{family_id}", headers=auth_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_get_nonexistent_student_404_not_403(client, auth_headers):
    resp = await client.get(
        "/api/users/students/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert resp.status_code == 404
