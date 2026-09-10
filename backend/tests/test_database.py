import pytest
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.job import Job, Application

def test_create_and_query_entities():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = User(email="alex.chen@university.edu", name="Alex Chen", role="student")
        db.add(user)
        db.commit()
        db.refresh(user)
        assert user.id is not None
        assert user.email == "alex.chen@university.edu"

        job = Job(
            title="Junior Cloud Engineer",
            company="Nexus Labs",
            location="Remote",
            skills_required=["AWS", "Linux"]
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        assert job.id is not None
        assert "AWS" in job.skills_required
    finally:
        db.close()
