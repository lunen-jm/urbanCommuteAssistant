#!/usr/bin/env python
# quick_api_fix.py - Minimal changes to fix API integrations while preserving keys

import os
import sys
import shutil
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("API-Fix")

def backup_file(file_path):
    """Create a backup of a file before modifying it"""
    backup_path = f"{file_path}.bak"
    try:
        shutil.copy2(file_path, backup_path)
        logger.info(f"Created backup of {file_path} to {backup_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to create backup of {file_path}: {e}")
        return False

def fix_redis_url():
    """Fix the Redis URL in the backend .env file to use Docker service name"""
    env_file = "backend/.env"
    
    try:
        # Read current content
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Create backup
        backup_file(env_file)
        
        # Replace Redis URL if found
        modified = False
        for i, line in enumerate(lines):
            if line.strip().startswith("REDIS_URL="):
                if "localhost" in line:
                    lines[i] = "REDIS_URL=redis://redis:6379/0\n"
                    modified = True
                    logger.info("Updated Redis URL to use Docker service name")
        
        # Write modified content
        if modified:
            with open(env_file, 'w') as f:
                f.writelines(lines)
        
        return True
    except Exception as e:
        logger.error(f"Error fixing Redis URL: {e}")
        return False

def ensure_frontend_env():
    """Ensure frontend .env file has the correct API URL"""
    env_file = "frontend/.env"
    api_url = "VITE_API_URL=http://localhost:8000/api"
    
    try:
        # Check if file exists
        if os.path.exists(env_file):
            # Read current content
            with open(env_file, 'r') as f:
                content = f.read()
            
            # Create backup
            backup_file(env_file)
            
            # Check if API URL is already correct
            if api_url in content:
                logger.info("Frontend .env already has correct API URL")
                return True
            
            # Replace or add API URL
            lines = content.splitlines()
            modified = False
            
            for i, line in enumerate(lines):
                if line.startswith("VITE_API_URL="):
                    lines[i] = api_url
                    modified = True
            
            if not modified:
                lines.append(api_url)
            
            # Write modified content
            with open(env_file, 'w') as f:
                f.write("\n".join(lines) + "\n")
            
            logger.info("Updated frontend .env with correct API URL")
        else:
            # Create new file with minimal content
            with open(env_file, 'w') as f:
                f.write(f"{api_url}\n")
            
            logger.info("Created new frontend .env file with API URL")
        
        return True
    except Exception as e:
        logger.error(f"Error ensuring frontend .env: {e}")
        return False

def run_docker_compose_restart():
    """Restart Docker services after making changes"""
    try:
        import subprocess
        
        logger.info("Restarting Docker containers...")
        subprocess.run(["docker-compose", "restart", "backend", "frontend"], check=True)
        
        logger.info("Services restarted successfully")
        return True
    except Exception as e:
        logger.error(f"Error restarting services: {e}")
        logger.info("You may need to manually restart the services with: docker-compose restart backend frontend")
        return False

def main():
    """Run all fix steps"""
    logger.info("Starting API integration quick fix")
    
    # Change to project root if not already there
    if os.path.isdir("urban-commute-assistant"):
        os.chdir("urban-commute-assistant")
    
    steps = [
        ("Fix Redis URL", fix_redis_url),
        ("Ensure frontend .env", ensure_frontend_env),
        ("Restart services", run_docker_compose_restart)
    ]
    
    results = {}
    
    for name, func in steps:
        logger.info(f"Running step: {name}")
        try:
            result = func()
            results[name] = result
        except Exception as e:
            logger.error(f"Step failed: {name} - {e}")
            results[name] = False
    
    # Print summary
    logger.info("\n=== Fix Summary ===")
    for name, result in results.items():
        logger.info(f"{name}: {'✅ Success' if result else '❌ Failed'}")
    
    # Final instructions
    logger.info("\n=== Next Steps ===")
    logger.info("1. Test your app's API connections")
    logger.info("2. Check Docker logs if issues persist: docker-compose logs backend")
    logger.info("3. Run API health check: docker-compose exec backend python check_api_health.py")
    
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())
