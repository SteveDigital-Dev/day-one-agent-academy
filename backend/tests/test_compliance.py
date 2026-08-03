"""Compliance: hour logs, IHIP, quarterly reports, assessments, status."""

import pytest


@pytest.mark.asyncio
async def test_log_hours(client, auth_headers, demo_student):
    resp = await client.post(
        f"/api/compliance/hours?student_id={demo_student.id}",
        json={"log_date": "2025-09-15", "hours": 3.5, "description": "Math practice"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["hours"] == 3.5
    assert data["log_date"] == "2025-09-15"


@pytest.mark.asyncio
async def test_hour_summary(client, auth_headers, demo_student):
    # Log a few hours first
    for h in [2.0, 1.5, 3.0]:
        await client.post(
            f"/api/compliance/hours?student_id={demo_student.id}",
            json={"log_date": "2025-09-15", "hours": h},
            headers=auth_headers,
        )
    resp = await client.get(
        f"/api/compliance/hours/summary?student_id={demo_student.id}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_hours"] >= 6.5
    assert data["days_logged"] >= 1


@pytest.mark.asyncio
async def test_create_ihip(client, auth_headers, demo_student):
    resp = await client.post(
        f"/api/compliance/ihip?student_id={demo_student.id}",
        json={
            "curriculum_materials": {"Math": "Saxon Math 3"},
            "quarterly_report_dates": ["2025-11-15", "2026-01-31", "2026-04-15", "2026-06-30"],
            "instructors": [{"name": "Test Parent", "role": "Primary"}],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "draft"
    assert data["school_year"] == "2025-2026"


@pytest.mark.asyncio
async def test_submit_ihip(client, auth_headers, demo_student):
    # Create
    create = await client.post(
        f"/api/compliance/ihip?student_id={demo_student.id}",
        json={
            "curriculum_materials": {"Math": "Saxon Math 3"},
            "quarterly_report_dates": ["2025-11-15", "2026-01-31", "2026-04-15", "2026-06-30"],
            "instructors": [{"name": "Test Parent", "role": "Primary"}],
        },
        headers=auth_headers,
    )
    doc_id = create.json()["id"]
    # Submit
    resp = await client.post(
        f"/api/compliance/ihip/{doc_id}/submit",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "submitted"


@pytest.mark.asyncio
async def test_create_quarterly_report(client, auth_headers, demo_student):
    resp = await client.post(
        f"/api/compliance/quarterly-reports?student_id={demo_student.id}",
        json={
            "quarter_number": 1,
            "hours_this_quarter": 225,
            "material_covered": {"Math": "Chapters 1-5"},
            "grades_or_narrative": {"Math": "A"},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["quarter_number"] == 1
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_create_assessment(client, auth_headers, demo_student):
    resp = await client.post(
        f"/api/compliance/assessments?student_id={demo_student.id}",
        json={
            "assessment_type": "standardized_test",
            "test_name": "Iowa Assessments",
            "score": 85,
            "percentile": 52,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["meets_threshold"] is True


@pytest.mark.asyncio
async def test_create_assessment_below_threshold(client, auth_headers, demo_student):
    resp = await client.post(
        f"/api/compliance/assessments?student_id={demo_student.id}",
        json={
            "assessment_type": "standardized_test",
            "test_name": "Iowa Assessments",
            "score": 45,
            "percentile": 22,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["meets_threshold"] is False
    assert data["probation_status"] == "active"


@pytest.mark.asyncio
async def test_compliance_status(client, auth_headers, demo_student):
    # Create IHIP first
    await client.post(
        f"/api/compliance/ihip?student_id={demo_student.id}",
        json={
            "curriculum_materials": {"Math": "Saxon Math 3"},
            "quarterly_report_dates": ["2025-11-15", "2026-01-31", "2026-04-15", "2026-06-30"],
            "instructors": [{"name": "Test Parent", "role": "Primary"}],
        },
        headers=auth_headers,
    )
    resp = await client.get(
        f"/api/compliance/status?student_id={demo_student.id}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["school_year"] == "2025-2026"
    assert data["ihip_status"] == "draft"
    assert "hours_target" in data
    assert data["days_target"] == 180


# --- Cross-family IDOR regression tests ---
# _resolve_student's "parent" branch used to skip the ownership check
# entirely - any authenticated parent could read/write ANY other family's
# compliance data (IHIP, quarterly reports, assessments, hour logs) just by
# passing a different student_id. These lock in the fix.


@pytest.mark.asyncio
async def test_cannot_log_hours_for_other_parents_student(client, auth_headers_2, demo_student):
    resp = await client.post(
        f"/api/compliance/hours?student_id={demo_student.id}",
        json={"log_date": "2026-01-15", "hours": 3, "description": "test"},
        headers=auth_headers_2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_read_other_parents_hour_summary(client, auth_headers_2, demo_student):
    resp = await client.get(
        f"/api/compliance/hours/summary?student_id={demo_student.id}", headers=auth_headers_2
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_create_ihip_for_other_parents_student(client, auth_headers_2, demo_student):
    resp = await client.post(
        f"/api/compliance/ihip?student_id={demo_student.id}",
        json={
            "curriculum_materials": {"Math": "Saxon Math 3"},
            "quarterly_report_dates": ["2025-11-15", "2026-01-31", "2026-04-15", "2026-06-30"],
            "instructors": [{"name": "Attacker", "role": "Primary"}],
        },
        headers=auth_headers_2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_read_other_parents_ihip(client, auth_headers_2, demo_student):
    resp = await client.get(
        f"/api/compliance/ihip?student_id={demo_student.id}", headers=auth_headers_2
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_submit_other_parents_ihip_by_doc_id(client, auth_headers, auth_headers_2, demo_student):
    """submit_ihip_endpoint took a raw doc_id with zero ownership check -
    the parent-vs-parent student_id gate above doesn't even apply here."""
    create = await client.post(
        f"/api/compliance/ihip?student_id={demo_student.id}",
        json={
            "curriculum_materials": {"Math": "Saxon Math 3"},
            "quarterly_report_dates": ["2025-11-15", "2026-01-31", "2026-04-15", "2026-06-30"],
            "instructors": [{"name": "Test Parent", "role": "Primary"}],
        },
        headers=auth_headers,
    )
    doc_id = create.json()["id"]
    resp = await client.post(f"/api/compliance/ihip/{doc_id}/submit", headers=auth_headers_2)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_generate_other_parents_ihip_pdf(client, auth_headers, auth_headers_2, demo_student):
    create = await client.post(
        f"/api/compliance/ihip?student_id={demo_student.id}",
        json={
            "curriculum_materials": {"Math": "Saxon Math 3"},
            "quarterly_report_dates": ["2025-11-15", "2026-01-31", "2026-04-15", "2026-06-30"],
            "instructors": [{"name": "Test Parent", "role": "Primary"}],
        },
        headers=auth_headers,
    )
    doc_id = create.json()["id"]
    resp = await client.post(f"/api/compliance/ihip/{doc_id}/generate", headers=auth_headers_2)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_create_quarterly_report_for_other_parents_student(client, auth_headers_2, demo_student):
    resp = await client.post(
        f"/api/compliance/quarterly-reports?student_id={demo_student.id}",
        json={
            "quarter_number": 1,
            "hours_this_quarter": 45,
            "material_covered": {"Math": "Saxon Math 3"},
            "grades_or_narrative": {"Math": "on track"},
        },
        headers=auth_headers_2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_create_assessment_for_other_parents_student(client, auth_headers_2, demo_student):
    resp = await client.post(
        f"/api/compliance/assessments?student_id={demo_student.id}",
        json={"assessment_type": "standardized_test", "score_percentile": 80},
        headers=auth_headers_2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_read_other_parents_compliance_status(client, auth_headers_2, demo_student):
    resp = await client.get(
        f"/api/compliance/status?student_id={demo_student.id}", headers=auth_headers_2
    )
    assert resp.status_code == 403
