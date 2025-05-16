#!/usr/bin/env python
# check_test_user_simple.py - Simple script to check if test user exists

import sys
import subprocess

def run_command(cmd, shell=True):
    """Run a command and return output"""
    try:
        result = subprocess.run(cmd, shell=shell, capture_output=True, text=True)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        return "", str(e), 1

def check_test_user():
    """Check if test user exists in the database"""
    print("Checking if test user exists in the database...")
    
    # Create a simple Python script to check the user
    cmd = """docker-compose exec -T backend python -c "
from app.db.session import SessionLocal
from app.db.models import User
db = SessionLocal()
user = db.query(User).filter(User.email=='test@example.com').first()
if user:
    print(f'Test user exists! ID: {user.id}, Username: {user.username}, Email: {user.email}')
else:
    print('Test user does not exist!')
"
"""
    
    stdout, stderr, returncode = run_command(cmd)
    
    if returncode != 0 or stderr:
        print(f"Error checking test user: {stderr}")
        return False
    
    print(stdout)
    return 'Test user exists' in stdout

def main():
    """Main function"""
    user_exists = check_test_user()
    
    if not user_exists:
        print("\nCreating test user...")
        cmd = "docker-compose exec -T backend python -m app.db.init_db"
        stdout, stderr, returncode = run_command(cmd)
        
        if returncode != 0 or stderr and 'Error' in stderr:
            print(f"Error creating test user: {stderr}")
            return 1
        
        print("Test user created. Verifying...")
        check_test_user()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
