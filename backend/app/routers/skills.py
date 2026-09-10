from fastapi import APIRouter

router = APIRouter(prefix="/api/skills", tags=["Skills & Benchmarks"])

ROLE_BENCHMARKS = {
    "Cloud Infrastructure Engineer": {
        "Cloud Platforms (AWS/GCP)": 90,
        "Kubernetes & Orchestration": 85,
        "Infrastructure as Code": 80,
        "Linux & Networking": 85,
        "CI/CD Pipelines": 75,
        "Security & Compliance": 70,
        "Monitoring & Observability": 75,
        "Scripting & Automation": 80,
    },
    "Machine Learning Engineer": {
        "Python & Numerical Computing": 95,
        "PyTorch / TensorFlow": 90,
        "MLOps & Deployment": 75,
        "Data Engineering & SQL": 80,
        "Model Optimization": 85,
        "Math & Statistics": 90,
        "API Integration": 80,
        "Experiment Tracking": 85,
    },
    "Full-Stack Developer": {
        "Frontend (React/Next)": 95,
        "Backend (Node/Python)": 90,
        "API Design & REST": 85,
        "Database & SQL": 80,
        "Testing & QA": 75,
        "DevOps Basics": 70,
        "System Architecture": 80,
        "Security Fundamentals": 75,
    }
}

@router.get("/benchmarks")
async def get_benchmarks():
    return ROLE_BENCHMARKS
