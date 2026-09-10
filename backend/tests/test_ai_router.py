import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app

@pytest.mark.asyncio
async def test_ai_mentor_chat_endpoint():
    transport = ASGITransport(app=app)
    mock_reply = {
        "reply": "Here is advice on Kubernetes for you, Alex.",
        "model": "@cf/meta/llama-3.1-8b-instruct-fp8",
        "success": True
    }
    with patch("app.routers.ai.generate_mentor_reply", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = mock_reply
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/ai/mentor/chat", json={
                "messages": [{"role": "user", "content": "How do I learn Kubernetes?"}],
                "student_profile": {"name": "Alex Chen", "major": "Computer Science"}
            })
        assert response.status_code == 200
        data = response.json()
        assert data["reply"] == mock_reply["reply"]
        assert data["model"] == mock_reply["model"]
        assert data["success"] is True
