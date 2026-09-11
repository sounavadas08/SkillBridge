from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.interview import InterviewSlot
from app.schemas.interview import InterviewSlotCreate, InterviewSlotUpdate, InterviewSlotResponse

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])

DEFAULT_INTERVIEW_SLOTS = [
    {
        "day": "Mon",
        "date": "Sep 14",
        "time": "10:00 AM",
        "status": "available",
        "candidate_name": None,
        "candidate_school": None,
        "interviewer": "Engineering Panel",
        "round_type": "Technical Coding",
        "notes": "Open slot for shortlisted backend/frontend candidates."
    },
    {
        "day": "Mon",
        "date": "Sep 14",
        "time": "02:00 PM",
        "status": "confirmed",
        "candidate_name": "Alex Chen",
        "candidate_school": "Stanford University",
        "interviewer": "Dr. Aris Vance (Lead Architect)",
        "round_type": "System Architecture",
        "notes": "Distributed state synchronization and high-throughput evaluation."
    },
    {
        "day": "Tue",
        "date": "Sep 15",
        "time": "11:30 AM",
        "status": "confirmed",
        "candidate_name": "Sarah Jenkins",
        "candidate_school": "MIT",
        "interviewer": "Kavita Rao (Staff DB Engineer)",
        "round_type": "Technical Coding",
        "notes": "Async database optimization and concurrent transaction deep dive."
    },
    {
        "day": "Tue",
        "date": "Sep 15",
        "time": "03:30 PM",
        "status": "confirmed",
        "candidate_name": "David Miller (Stanford Senior)",
        "candidate_school": "Stanford University",
        "interviewer": "Marcus Brody (VP of Engineering)",
        "round_type": "System Architecture",
        "notes": "Compiler optimization & high-performance WebGL state pipeline."
    },
    {
        "day": "Wed",
        "date": "Sep 16",
        "time": "09:00 AM",
        "status": "available",
        "candidate_name": None,
        "candidate_school": None,
        "interviewer": "Engineering Panel",
        "round_type": "Technical Coding",
        "notes": "Morning slot for algorithmic problem solving."
    },
    {
        "day": "Wed",
        "date": "Sep 16",
        "time": "01:00 PM",
        "status": "available",
        "candidate_name": None,
        "candidate_school": None,
        "interviewer": "Engineering Panel",
        "round_type": "Behavioral & Culture",
        "notes": "Team fit, communication & cross-functional leadership."
    },
    {
        "day": "Thu",
        "date": "Sep 17",
        "time": "10:30 AM",
        "status": "confirmed",
        "candidate_name": "Marcus Vance",
        "candidate_school": "UC Berkeley",
        "interviewer": "Elena Gilbert (Design Tech Lead)",
        "round_type": "Behavioral & Culture",
        "notes": "Component architecture, design systems & team collaboration."
    },
    {
        "day": "Thu",
        "date": "Sep 17",
        "time": "04:00 PM",
        "status": "available",
        "candidate_name": None,
        "candidate_school": None,
        "interviewer": "Engineering Panel",
        "round_type": "Technical Coding",
        "notes": "Late afternoon technical evaluation slot."
    },
    {
        "day": "Fri",
        "date": "Sep 18",
        "time": "02:30 PM",
        "status": "available",
        "candidate_name": None,
        "candidate_school": None,
        "interviewer": "Talent Operations",
        "round_type": "Executive Review",
        "notes": "Final wrap-up and offer formulation discussion."
    }
]

@router.get("", response_model=List[InterviewSlotResponse])
def get_all_interviews(db: Session = Depends(get_db)):
    slots = db.query(InterviewSlot).all()
    if not slots:
        # Auto-seed database with default ledger entries
        for item in DEFAULT_INTERVIEW_SLOTS:
            db_slot = InterviewSlot(**item)
            db.add(db_slot)
        db.commit()
        slots = db.query(InterviewSlot).all()
    return slots

@router.post("", response_model=InterviewSlotResponse, status_code=status.HTTP_201_CREATED)
def create_interview_slot(payload: InterviewSlotCreate, db: Session = Depends(get_db)):
    slot = InterviewSlot(**payload.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@router.put("/{slot_id}", response_model=InterviewSlotResponse)
def update_interview_slot(slot_id: int, payload: InterviewSlotUpdate, db: Session = Depends(get_db)):
    slot = db.query(InterviewSlot).filter(InterviewSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Interview slot not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(slot, key, value)
    
    db.commit()
    db.refresh(slot)
    return slot

@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview_slot(slot_id: int, db: Session = Depends(get_db)):
    slot = db.query(InterviewSlot).filter(InterviewSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Interview slot not found")
    db.delete(slot)
    db.commit()
    return None
