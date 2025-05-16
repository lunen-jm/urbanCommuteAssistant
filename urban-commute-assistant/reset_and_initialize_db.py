#!/usr/bin/env python
# reset_and_initialize_db.py

import os
import sys
import subprocess
import time

def main():
    """Reset and reinitialize the database and user accounts"""
    print("Resetting and initializing the database...")
    
    try:
        # Check if containers are running
        result = subprocess.run(["docker-compose", "ps"], capture_output=True, text=True)
        if "backend" not in result.stdout:
            print("Starting services...")
            subprocess.run(["docker-compose", "up", "-d"], check=True)
            # Give services time to start
            time.sleep(10)
        
        # Stop and remove any existing db volumes
        print("Stopping services...")
        subprocess.run(["docker-compose", "down"], check=True)
        
        # Start services again
        print("Starting services with clean state...")
        subprocess.run(["docker-compose", "up", "-d"], check=True)
        
        # Give services time to start
        print("Waiting for services to start...")
        time.sleep(10)
        
        # Initialize the database with test users
        print("Initializing database with test user...")
        subprocess.run(["docker-compose", "exec", "-T", "backend", "python", "-m", "app.db.init_db"], check=True)
        
        print("\n✅ Database reset and initialized successfully!")
        print("\nTest user credentials:")
        print("- Email: test@example.com")
        print("- Username: testuser")
        print("- Password: password123")
        
        print("\nYou can now access the application at:")
        print("- Frontend: http://localhost:3000")
        print("- Backend API: http://localhost:8000")
        
        return 0
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
