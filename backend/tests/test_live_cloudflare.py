import pytest
from app.services.cloudflare_ai import generate_mentor_reply

@pytest.mark.asyncio
async def test_live_cloudflare_workers_ai():
    """
    Live end-to-end test against Cloudflare Workers AI using account token
    """
    result = await generate_mentor_reply(
        messages=[{"role": "user", "content": "Respond with 1 sentence of encouragement for a junior engineer."}],
        student_profile={"name": "Alex", "major": "Computer Science", "target_role": "Full-Stack Developer"}
    )
    assert result["success"] is True
    assert len(result["reply"]) > 10
    assert result["model"] == "@cf/meta/llama-3.1-8b-instruct-fp8"
