"""Auth: register, login, token validation, role enforcement."""

import pytest


@pytest.mark.asyncio
async def test_register(client):
    resp = await client.post("/api/auth/register", json={
        "email": "new@test.com",
        "password": "secret123",
        "full_name": "New User",
        "role": "parent",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/auth/register", json={
        "email": "dup@test.com", "password": "secret123",
        "full_name": "Dup", "role": "parent",
    })
    resp = await client.post("/api/auth/register", json={
        "email": "dup@test.com", "password": "secret123",
        "full_name": "Dup", "role": "parent",
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login(client, parent_user):
    resp = await client.post("/api/auth/login", json={
        "email": "parent@test.com", "password": "test1234",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client, parent_user):
    resp = await client.post("/api/auth/login", json={
        "email": "parent@test.com", "password": "wrong",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me(client, parent_token):
    resp = await client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {parent_token}",
    })
    assert resp.status_code == 200
    assert resp.json()["email"] == "parent@test.com"
    assert resp.json()["role"] == "parent"


@pytest.mark.asyncio
async def test_me_unauthorized(client):
    resp = await client.get("/api/auth/me")
    assert resp.status_code == 401
