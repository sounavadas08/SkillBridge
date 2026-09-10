import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_get_and_update_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Get profile
        get_res = await ac.get("/api/auth/profile")
        assert get_res.status_code == 200
        data = get_res.json()
        assert "name" in data
        assert "email" in data

        # 2. Update profile
        update_payload = {
            "name": "Alexander Chen",
            "bio": "Passionate developer exploring cutting-edge AI.",
            "avatar": "data:image/png;base64,newavatar123",
            "grad_year": "2022 - 2026",
            "specialization": "Cloud & AI Infrastructure",
            "github_url": "https://github.com/alexanderchen",
            "linkedin_url": "https://linkedin.com/in/alexanderchen",
            "portfolio_url": "https://alexanderchen.dev"
        }
        put_res = await ac.put("/api/auth/profile", json=update_payload)
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["name"] == "Alexander Chen"
        assert updated["bio"] == "Passionate developer exploring cutting-edge AI."
        assert updated["avatar"] == "data:image/png;base64,newavatar123"
        assert updated["grad_year"] == "2022 - 2026"
        assert updated["github_url"] == "https://github.com/alexanderchen"
