from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import app.models  # noqa: F401 - Register all models with Base.metadata
    Base.metadata.create_all(bind=engine)
    if "sqlite" in settings.database_url:
        with engine.connect() as conn:
            cursor = conn.connection.cursor()
            cursor.execute("PRAGMA table_info(users)")
            existing_cols = [row[1] for row in cursor.fetchall()]
            new_cols = [
                ("avatar", "TEXT"),
                ("bio", "TEXT"),
                ("grad_year", "VARCHAR"),
                ("specialization", "VARCHAR"),
                ("github_url", "VARCHAR"),
                ("linkedin_url", "VARCHAR"),
                ("portfolio_url", "VARCHAR"),
            ]
            for col_name, col_type in new_cols:
                if col_name not in existing_cols:
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            conn.connection.commit()

