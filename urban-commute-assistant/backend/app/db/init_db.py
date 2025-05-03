from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from app.core.config import Config
from app.db.base import Base
import app.db.models  # Import to register all models with Base

def init_database():
    """Initialize the database by creating all tables."""
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    
    # Create tables if they don't exist
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if not existing_tables:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    else:
        print("Database tables already exist")
    
    # Create a test user if it doesn't exist
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        from app.db.models import User
        from app.core.security import get_password_hash
        
        # Check specifically for our test user by email
        test_user_exists = db.query(User).filter(User.email == "test@example.com").first()
        
        if not test_user_exists:
            test_user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Test User"
            )
            db.add(test_user)
            db.commit()
            print("Created test user: testuser / password123")
        else:
            print("Test user already exists")
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()