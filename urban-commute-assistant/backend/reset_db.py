from sqlalchemy import create_engine
from app.core.config import settings
from app.db.base import Base
import app.db.models  # Import to register all models

def reset_database():
    """Drop all tables and recreate them."""
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped")
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("All tables recreated")
    
    print("Database reset complete")

if __name__ == "__main__":
    confirm = input("This will DELETE ALL DATA. Type 'yes' to confirm: ")
    if confirm.lower() == 'yes':
        reset_database()
    else:
        print("Database reset cancelled")