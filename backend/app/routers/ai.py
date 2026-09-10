from fastapi import APIRouter, HTTPException
from app.schemas.ai import (
    MentorChatRequest, 
    MentorChatResponse,
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewEvaluateRequest,
    InterviewEvaluateResponse
)
from app.services.cloudflare_ai import (
    generate_mentor_reply,
    generate_interview_questions,
    evaluate_interview_answer
)

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

@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_mock_interview(request: InterviewStartRequest):
    try:
        result = await generate_interview_questions(
            role=request.role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            count=request.count
        )
        return InterviewStartResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview/evaluate", response_model=InterviewEvaluateResponse)
async def evaluate_interview_response(request: InterviewEvaluateRequest):
    try:
        result = await evaluate_interview_answer(
            role=request.role,
            question=request.question,
            student_answer=request.student_answer
        )
        return InterviewEvaluateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
