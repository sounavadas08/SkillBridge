from fastapi import APIRouter, HTTPException
from app.schemas.ai import MentorChatRequest, MentorChatResponse
from app.services.cloudflare_ai import generate_mentor_reply

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

@router.post("/mentor/chat", response_model=MentorChatResponse)
async def chat_with_mentor(request: MentorChatRequest):
    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        profile_dict = request.student_profile.model_dump() if request.student_profile else None

        result = await generate_mentor_reply(
            messages=messages_dict,
            student_profile=profile_dict
        )
        return MentorChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
