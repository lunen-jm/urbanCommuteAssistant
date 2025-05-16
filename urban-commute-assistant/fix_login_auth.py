"""
Login Authentication Debugger and Fixer

This script diagnoses and fixes issues with login authentication by:
1. Checking database connection
2. Verifying if the test user exists in the database
3. Creating the test user if it doesn't exist
4. Testing login with the test credentials
"""

import os
import sys
import subprocess
import requests
import time
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import json

# Password hashing context (must match the one in app/core/security.py)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def check_services():
    """Check if Docker services are running"""
    print("\n[1/5] Checking Docker services...")
    
    try:
        output = subprocess.check_output(["docker-compose", "ps", "-a"], text=True)
        print(output)
        
        if "backend" not in output or "frontend" not in output:
            print("❌ Services not found. Starting services...")
            subprocess.run(["docker-compose", "up", "-d"], check=True)
            time.sleep(10)  # Wait for services to start
        else:
            print("✅ Docker services found")
        
        # Check if db service is in docker-compose.yml
        with open('docker-compose.yml', 'r') as f:
            docker_compose = f.read()
            if 'db:' not in docker_compose:
                print("⚠️ Warning: No database service found in docker-compose.yml")
                print("   You may need to add a PostgreSQL service to your docker-compose.yml file")
    except Exception as e:
        print(f"❌ Error checking services: {e}")
        return False
    
    return True

def check_database_connection():
    """Check the database connection"""
    print("\n[2/5] Checking database connection...")
    
    # Check the environment variables
    env_file_path = 'backend/.env'
    db_url = None
    
    # Read .env file
    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    db_url = line.strip().split('=', 1)[1]
                    print(f"Found DATABASE_URL: {db_url}")
                    break
    
    if not db_url:
        print("❌ DATABASE_URL not found in .env file")
        return False
    
    # Check if the connection works
    try:
        engine = create_engine(db_url)
        connection = engine.connect()
        connection.close()
        print("✅ Successfully connected to the database")
        return engine
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        
        # Check if we're using PostgreSQL but falling back to SQLite
        if 'postgresql://' in db_url:
            fallback_url = 'sqlite:///backend/site.db'
            print(f"Trying fallback SQLite connection: {fallback_url}")
            try:
                engine = create_engine(fallback_url)
                connection = engine.connect()
                connection.close()
                print("✅ Successfully connected to fallback SQLite database")
                return engine
            except Exception as e2:
                print(f"❌ Fallback connection error: {e2}")
        
        return None

def check_test_user(engine):
    """Check if test user exists in the database"""
    print("\n[3/5] Checking if test user exists...")
    
    if not engine:
        return False
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if users table exists
        inspector = inspect(engine)
        if 'users' not in inspector.get_table_names():
            print("❌ Users table does not exist in the database")
            return False
        
        # Check for test user
        result = session.execute(text("SELECT * FROM users WHERE email = 'test@example.com'"))
        user = result.fetchone()
        
        if user:
            print(f"✅ Test user found: {user}")
            return True
        else:
            print("❌ Test user not found")
            return False
    except Exception as e:
        print(f"❌ Error checking for test user: {e}")
        return False
    finally:
        session.close()

def create_test_user(engine):
    """Create the test user in the database"""
    print("\n[4/5] Creating test user...")
    
    if not engine:
        return False
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if users table exists
        inspector = inspect(engine)
        if 'users' not in inspector.get_table_names():
            print("❌ Users table does not exist, attempting to create it...")
            # Try to run database initialization
            subprocess.run(["docker-compose", "exec", "backend", "python", "-m", "app.db.init_db"], check=True)
            print("Database initialization completed")
            
            # Check again if users table exists
            if 'users' not in inspector.get_table_names():
                print("❌ Failed to create users table")
                return False
        
        # Create test user with hashed password
        hashed_password = get_password_hash("password123")
        session.execute(
            text("""
            INSERT INTO users 
            (username, email, hashed_password, full_name, disabled, created_at, updated_at) 
            VALUES 
            (:username, :email, :hashed_password, :full_name, :disabled, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {
                "username": "testuser",
                "email": "test@example.com",
                "hashed_password": hashed_password,
                "full_name": "Test User",
                "disabled": False
            }
        )
        session.commit()
        print("✅ Test user created successfully")
        return True
    except Exception as e:
        session.rollback()
        print(f"❌ Error creating test user: {e}")
        return False
    finally:
        session.close()

def test_login():
    """Test login with the test user credentials"""
    print("\n[5/5] Testing login with test user credentials...")
    
    # Try to get the API base URL from the frontend .env file
    api_base_url = None
    env_file_path = 'frontend/.env'
    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as f:
            for line in f:
                if line.startswith('VITE_API_URL='):
                    api_base_url = line.strip().split('=', 1)[1]
                    break
    
    if not api_base_url:
        api_base_url = 'http://localhost:8000/api'
    
    login_url = f"{api_base_url}/auth/token"
    print(f"Login URL: {login_url}")
    
    try:
        # Create form data for login (OAuth2 compatible)
        form_data = {
            'username': 'test@example.com',  # Either username or email should work
            'password': 'password123'
        }
        
        response = requests.post(login_url, data=form_data, timeout=10)
        
        if response.status_code == 200:
            print("✅ Login successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Login failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing login: {e}")
        return False

def main():
    print("="*60)
    print("LOGIN AUTHENTICATION DEBUGGER AND FIXER")
    print("="*60)
    
    if not check_services():
        print("\n❌ Failed to check services. Please ensure Docker is running.")
        sys.exit(1)
    
    engine = check_database_connection()
    if not engine:
        print("\n❌ Database connection failed. Cannot proceed.")
        sys.exit(1)
    
    user_exists = check_test_user(engine)
    if not user_exists:
        if not create_test_user(engine):
            print("\n❌ Failed to create test user. Please check database permissions.")
            sys.exit(1)
    
    if test_login():
        print("\n✅ Login authentication is now working!")
        print("You can use the following credentials to log in:")
        print("Email: test@example.com")
        print("Password: password123")
    else:
        print("\n⚠️ Login still failing. Additional debugging required.")
        print("Please check:")
        print("1. Backend logs for authentication errors")
        print("2. API endpoints in frontend config")
        print("3. CORS configuration in backend")

if __name__ == "__main__":
    main()
