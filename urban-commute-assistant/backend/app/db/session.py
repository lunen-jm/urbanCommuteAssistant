from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import StaticPool
from app.core.config import Config

# Check if we're using SQLite (which has threading limitations)
is_sqlite = Config.SQLALCHEMY_DATABASE_URI.startswith('sqlite')

# Configure engine with appropriate parameters based on database type
if is_sqlite:
    # For SQLite, use connect_args with check_same_thread=False to allow cross-thread usage
    # And use StaticPool to maintain a single connection
    engine = create_engine(
        Config.SQLALCHEMY_DATABASE_URI,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    # For other databases (PostgreSQL, MySQL, etc.), use standard configuration
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)

# Create session factory
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()