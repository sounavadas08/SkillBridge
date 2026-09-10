import httpx
from typing import List, Dict, Any, Optional
from app.config import get_settings

FALLBACK_REPLY = (
    "I have analyzed your request based on your current SkillBridge profile. "
    "To accelerate your industry readiness, focus on hands-on project implementations "
    "and reviewing the benchmark competencies highlighted in your Skill-Gap Radar."
)

async def generate_mentor_reply(
    messages: List[Dict[str, str]],
    student_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Calls Cloudflare Workers AI OpenAI-compatible chat completions endpoint.
    Injects student profile context into the system prompt and returns structured output.
    """
    settings = get_settings()

    student_name = student_profile.get("name", "Student") if student_profile else "Student"
    major = student_profile.get("major", "Computer Science") if student_profile else "Computer Science"
    target_role = student_profile.get("target_role", "Software Engineer") if student_profile else "Software Engineer"
    skills = ", ".join(student_profile.get("skills", ["General Software Engineering"])) if student_profile else "General Software"

    system_prompt = (
        f"You are the SkillBridge AI Career Mentor, an expert career coach and technical mentor.\n"
        f"Student Profile:\n"
        f"- Name: {student_name}\n"
        f"- Major: {major}\n"
        f"- Current Strengths: {skills}\n"
        f"- Target Career Benchmark: {target_role}\n\n"
        f"Instructions:\n"
        f"- Provide direct, highly structured, encouraging technical advice.\n"
        f"- Use markdown formatting (bold text, bullet points, clean code snippets where relevant).\n"
        f"- Focus on bridging skills gaps for industry placement."
    )

    full_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if msg.get("role") in ["user", "assistant"]:
            full_messages.append({"role": msg["role"], "content": msg["content"]})

    url = f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}/ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.cloudflare_api_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.cloudflare_model,
        "messages": full_messages
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        choices = data.get("choices", [])
        if choices and "message" in choices[0]:
            content = choices[0]["message"].get("content", "").strip()
            if content:
                return {
                    "reply": content,
                    "model": settings.cloudflare_model,
                    "success": True
                }
    except Exception as e:
        print(f"[Cloudflare AI Service] Error: {e}, falling back to local synthesizer.")

    return {
        "reply": FALLBACK_REPLY,
        "model": "skillbridge-local-fallback",
        "success": False
    }
