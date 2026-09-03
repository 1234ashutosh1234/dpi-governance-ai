from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

# Project root:
# F:\AI for Digital Public Infrastructure & Governance\dpi-governance-ai
#
# database.py is located at:
# backend/app/db/database.py
#
# parents[3] = dpi-governance-ai
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# Always use ONE fixed SQLite database file.
DATABASE_PATH = PROJECT_ROOT / "dpi_governance.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    },
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()