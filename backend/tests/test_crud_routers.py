import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_skills_benchmarks():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/skills/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert "Cloud Infrastructure Engineer" in data
    assert "Machine Learning Engineer" in data

@pytest.mark.asyncio
async def test_jobs_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 1
    assert any(j["title"] == "Junior ML Engineer" for j in jobs)

@pytest.mark.asyncio
async def test_applications_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Get applications
        get_res = await ac.get("/api/applications")
        assert get_res.status_code == 200
        apps = get_res.json()
        assert len(apps) >= 1

        # Post application
        post_res = await ac.post("/api/applications", json={
            "job_id": 1,
            "role_title": "AI Research Assistant",
            "company": "Deep Labs",
            "match_confidence": 95,
            "status": "Interview Scheduled",
            "date_submitted": "Sep 10, 2026"
        })
        assert post_res.status_code == 200
        new_app = post_res.json()
        assert new_app["company"] == "Deep Labs"
        assert new_app["id"] is not None

@pytest.mark.asyncio
async def test_auth_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "alex@stanford.edu",
            "name": "Alex Chen",
            "role": "student"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "alex@stanford.edu"
        assert "token" in data
