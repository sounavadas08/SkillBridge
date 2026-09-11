from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import Job, Application
from app.schemas.job import JobResponse, ApplicationCreate, ApplicationResponse
from typing import List

router = APIRouter(prefix="/api", tags=["Jobs & Applications"])

DEFAULT_JOBS = [
    {
        "id": 1,
        "title": "Software Engineering Intern",
        "company": "Google",
        "location": "Mountain View, CA",
        "work_type": "Hybrid",
        "duration": "3 Months",
        "skills_required": ["Python", "Go", "Distributed Systems", "Algorithms"],
        "match_score_base": 96
    },
    {
        "id": 2,
        "title": "Full-Stack Systems Intern",
        "company": "Stripe",
        "location": "San Francisco, CA",
        "work_type": "Remote",
        "duration": "4 Months",
        "skills_required": ["React", "TypeScript", "Node.js", "PostgreSQL"],
        "match_score_base": 94
    },
    {
        "id": 3,
        "title": "Applied AI & ML Intern",
        "company": "Microsoft",
        "location": "Redmond, WA",
        "work_type": "Hybrid",
        "duration": "6 Months",
        "skills_required": ["PyTorch", "Python", "Azure AI", "Transformers"],
        "match_score_base": 91
    },
    {
        "id": 4,
        "title": "Deep Learning & CUDA Intern",
        "company": "NVIDIA",
        "location": "Santa Clara, CA",
        "work_type": "On-Site",
        "duration": "6 Months",
        "skills_required": ["C++", "CUDA", "Python", "TensorRT"],
        "match_score_base": 89
    },
    {
        "id": 5,
        "title": "Cloud DevOps Intern",
        "company": "Amazon Web Services",
        "location": "Seattle, WA",
        "work_type": "Hybrid",
        "duration": "3 Months",
        "skills_required": ["AWS", "Kubernetes", "Docker", "Terraform"],
        "match_score_base": 88
    },
    {
        "id": 6,
        "title": "Production Engineering Intern",
        "company": "Meta",
        "location": "Menlo Park, CA",
        "work_type": "Remote",
        "duration": "3 Months",
        "skills_required": ["Linux", "Python", "CI/CD", "Distributed Systems"],
        "match_score_base": 86
    }
]

@router.get("/jobs", response_model=List[JobResponse])
async def list_jobs(db: Session = Depends(get_db)):
    db_jobs = db.query(Job).all()
    if not any(j.company == "Google" for j in db_jobs):
        for item in DEFAULT_JOBS:
            if not any(j.company == item["company"] and j.title == item["title"] for j in db_jobs):
                job = Job(
                    title=item["title"],
                    company=item["company"],
                    location=item["location"],
                    work_type=item["work_type"],
                    duration=item["duration"],
                    skills_required=item["skills_required"],
                    match_score_base=item["match_score_base"]
                )
                db.add(job)
        db.commit()
        db_jobs = db.query(Job).all()

    return db_jobs


@router.get("/applications", response_model=List[ApplicationResponse])
async def list_applications(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    if not apps:
        seed_apps = [
            Application(
                id=1,
                job_id=1,
                role_title="Junior ML Engineer",
                company="Apex Data Systems",
                match_confidence=94,
                status="Interview Scheduled",
                date_submitted="Aug 28, 2026"
            ),
            Application(
                id=2,
                job_id=2,
                role_title="Full-Stack Intern",
                company="Novus Cloud",
                match_confidence=87,
                status="Under Review",
                date_submitted="Sep 02, 2026"
            ),
            Application(
                id=3,
                job_id=3,
                role_title="Backend Developer",
                company="Stratosphere Labs",
                match_confidence=91,
                status="Offer Extended",
                date_submitted="Sep 04, 2026"
            )
        ]
        for a in seed_apps:
            db.add(a)
        db.commit()
        apps = db.query(Application).all()
    return apps

@router.post("/applications", response_model=ApplicationResponse)
async def create_application(app_data: ApplicationCreate, db: Session = Depends(get_db)):
    new_app = Application(**app_data.model_dump(), user_id=1)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app
