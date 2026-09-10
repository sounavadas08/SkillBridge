import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.cloudflare_ai import generate_mentor_reply

@pytest.mark.asyncio
async def test_generate_mentor_reply_mocked():
    mock_payload = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "To master Docker, start with building simple Dockerfiles and containers."
                }
            }
        ]
    }
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_payload
    mock_resp.raise_for_status = lambda: None

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp

        res = await generate_mentor_reply(
            messages=[{"role": "user", "content": "How do I learn Docker?"}],
            student_profile={"name": "Alex", "major": "Computer Science"}
        )
        assert "Docker" in res["reply"]
        assert res["success"] is True
        assert res["model"] == "@cf/meta/llama-3.1-8b-instruct-fp8"

@pytest.mark.asyncio
async def test_generate_mentor_reply_fallback_on_error():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = Exception("Simulated connection timeout")

        res = await generate_mentor_reply(
            messages=[{"role": "user", "content": "Tell me about cloud roles"}],
            student_profile={"name": "Alex"}
        )
        assert res["success"] is False
        assert "SkillBridge" in res["reply"]
