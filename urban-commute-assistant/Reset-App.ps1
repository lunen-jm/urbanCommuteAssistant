# Reset-App.ps1 - Script to reset and reinitialize the Urban Commute Assistant app

Write-Host "Urban Commute Assistant - Reset and Reinitialize" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Stop and remove all containers, networks, and volumes
Write-Host "`nStep 1: Stopping and removing all containers..." -ForegroundColor Yellow
docker-compose down -v

# 2. Start services
Write-Host "`nStep 2: Starting services with clean state..." -ForegroundColor Yellow
docker-compose up -d

# 3. Wait for services to start
Write-Host "`nStep 3: Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Initialize the database with test user
Write-Host "`nStep 4: Creating test user..." -ForegroundColor Yellow
docker-compose exec -T backend python -m app.db.init_db

Write-Host "`n✅ Reset completed successfully!" -ForegroundColor Green
Write-Host "`nTest User Credentials:" -ForegroundColor Cyan
Write-Host "Email: test@example.com" -ForegroundColor White
Write-Host "Username: testuser" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White

Write-Host "`nApplication URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor White

Write-Host "`nNOTE: You can log in with either the email or username" -ForegroundColor Yellow
