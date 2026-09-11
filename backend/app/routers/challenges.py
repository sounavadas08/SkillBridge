from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.challenge import Challenge, ChallengeSubmission
from app.schemas.challenge import (
    ChallengeCreate, ChallengeUpdate, ChallengeResponse,
    SubmissionCreate, SubmissionResponse
)

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])

DEFAULT_CHALLENGES = [
    {
        "title": "High-Performance Virtualized Table Component",
        "company": "Stripe Ecosystem Challenge",
        "category": "frontend",
        "tick_class": "rp-tick-frontend",
        "stipend": "$750 USD",
        "duration": "3 Days",
        "status": "Active Submissions",
        "description": "Build a zero-dependency React virtualized list table handling 100,000 items with 60fps scrolling and keyboard navigation.",
        "tags": "React, TypeScript, Virtualization, Performance",
        "starter_repo": "https://github.com/skillbridge/virtual-table-spec",
        "applicants_count": 18,
        "verified_count": 4,
        "submissions": [
            {
                "candidate_name": "Alex Chen",
                "candidate_email": "alex.chen@university.edu",
                "candidate_school": "Stanford University",
                "repo_url": "https://github.com/alexchen/react-virtual-grid-60fps",
                "demo_url": "https://react-virtual-grid-preview.vercel.app",
                "notes": "Built using custom binary search row offset calculation, zero DOM layout thrashing, and dynamic item height caching.",
                "status": "verified"
            },
            {
                "candidate_name": "David Miller",
                "candidate_email": "david.miller@stanford.edu",
                "candidate_school": "Stanford University",
                "repo_url": "https://github.com/davidmiller/virtual-table-stripe",
                "demo_url": "https://davidm-table.dev",
                "notes": "Complete with keyboard navigation (arrow keys, PgUp/PgDn) and virtualized column pinning.",
                "status": "submitted"
            }
        ]
    },
    {
        "title": "Distributed Transaction Rate Limiter",
        "company": "Fintech Infrastructure",
        "category": "backend",
        "tick_class": "rp-tick-backend",
        "stipend": "$1,200 USD",
        "duration": "5 Days",
        "status": "Active Submissions",
        "description": "Implement a token-bucket rate-limiting middleware in Node.js/Go backed by Redis sliding logs with failure fallback.",
        "tags": "Go, Redis, Rate Limiting, Distributed Systems",
        "starter_repo": "https://github.com/skillbridge/rate-limiter-starter",
        "applicants_count": 12,
        "verified_count": 2,
        "submissions": [
            {
                "candidate_name": "Sarah Jenkins",
                "candidate_email": "sarah.j@mit.edu",
                "candidate_school": "MIT",
                "repo_url": "https://github.com/sarahj/redis-sliding-window-limiter",
                "demo_url": "",
                "notes": "Redis Lua script execution ensuring atomic sliding window calculations with in-memory memory ring buffer fallback.",
                "status": "verified"
            }
        ]
    },
    {
        "title": "PostgreSQL Query Execution Profiler",
        "company": "Data Scale Engine",
        "category": "data",
        "tick_class": "rp-tick-data",
        "stipend": "$900 USD",
        "duration": "4 Days",
        "status": "Active Submissions",
        "description": "Construct an automated SQL query analysis script identifying unindexed joins, high sequential scans, and index suggestions.",
        "tags": "PostgreSQL, SQL Tuning, Python, EXPLAIN ANALYZE",
        "starter_repo": "https://github.com/skillbridge/pg-query-profiler",
        "applicants_count": 15,
        "verified_count": 5,
        "submissions": []
    },
    {
        "title": "RAG Pipeline Vector Search Evaluator",
        "company": "AI Research Hub",
        "category": "ai",
        "tick_class": "rp-tick-ai",
        "stipend": "$1,500 USD",
        "duration": "1 Week",
        "status": "Active Submissions",
        "description": "Build an evaluation benchmark suite measuring context retrieval precision and recall across 500 embedding queries.",
        "tags": "Python, Vector Search, Embeddings, RAG, Benchmarking",
        "starter_repo": "https://github.com/skillbridge/rag-eval-benchmark",
        "applicants_count": 24,
        "verified_count": 7,
        "submissions": []
    }
]


def seed_default_challenges(db: Session):
    existing = db.query(Challenge).first()
    if not existing:
        for item in DEFAULT_CHALLENGES:
            subs = item.pop("submissions", [])
            challenge = Challenge(**item)
            db.add(challenge)
            db.flush()
            for sub_data in subs:
                sub = ChallengeSubmission(challenge_id=challenge.id, **sub_data)
                db.add(sub)
        db.commit()


@router.get("", response_model=List[ChallengeResponse])
def get_challenges(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    seed_default_challenges(db)
    query = db.query(Challenge)
    if category and category.lower() != "all":
        query = query.filter(Challenge.category == category.lower())
    return query.order_by(Challenge.id.desc()).all()


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    challenge_in: ChallengeCreate,
    db: Session = Depends(get_db)
):
    # Auto-assign tick class based on category
    tick_map = {
        "frontend": "rp-tick-frontend",
        "backend": "rp-tick-backend",
        "data": "rp-tick-data",
        "ai": "rp-tick-ai",
        "fullstack": "rp-tick-frontend",
        "cloud": "rp-tick-backend"
    }
    data = challenge_in.model_dump()
    if not data.get("tick_class") or data.get("tick_class") == "rp-tick-frontend":
        data["tick_class"] = tick_map.get(data.get("category", "").lower(), "rp-tick-frontend")

    new_challenge = Challenge(**data)
    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)
    return new_challenge


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.put("/{challenge_id}", response_model=ChallengeResponse)
def update_challenge(
    challenge_id: int,
    update_in: ChallengeUpdate,
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(challenge, field, val)

    db.commit()
    db.refresh(challenge)
    return challenge


@router.delete("/{challenge_id}", status_code=status.HTTP_200_OK)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    db.delete(challenge)
    db.commit()
    return {"message": "Challenge deleted successfully", "id": challenge_id}


# Candidate Submission Endpoints
@router.post("/{challenge_id}/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_solution(
    challenge_id: int,
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    submission = ChallengeSubmission(
        challenge_id=challenge_id,
        **submission_in.model_dump()
    )
    db.add(submission)
    challenge.applicants_count = (challenge.applicants_count or 0) + 1
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/{challenge_id}/submissions", response_model=List[SubmissionResponse])
def get_challenge_submissions(
    challenge_id: int,
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge.submissions


@router.put("/submissions/{submission_id}/verify", response_model=SubmissionResponse)
def verify_submission(
    submission_id: int,
    db: Session = Depends(get_db)
):
    submission = db.query(ChallengeSubmission).filter(ChallengeSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = "verified"
    if submission.challenge:
        submission.challenge.verified_count = (submission.challenge.verified_count or 0) + 1
    db.commit()
    db.refresh(submission)
    return submission
