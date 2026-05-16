@echo off
REM Checkmate.Uno Database Setup Script for Windows

echo ================================
echo Checkmate.Uno Database Setup
echo ================================
echo.

REM Check if .env exists
if not exist .env (
    echo Error: .env file not found!
    echo.
    echo Please create .env file first with:
    echo   DATABASE_URL=postgresql://postgres:password@host:6543/postgres?sslmode=require
    echo   JWT_SECRET=your-secret-key-at-least-32-chars
    echo.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

REM Check if DATABASE_URL is set
findstr /M "DATABASE_URL=" .env >nul
if errorlevel 1 (
    echo Error: DATABASE_URL not set in .env
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
call npm install --silent
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 2: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo Error: Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

echo Step 3: Running migrations...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo Error: Failed to run migrations
    pause
    exit /b 1
)
echo [OK] Migrations completed
echo.

echo Step 4: Verifying database connection...
call npx prisma db execute --stdin ^<nul
if errorlevel 1 (
    echo Error: Database connection failed
    pause
    exit /b 1
)
echo [OK] Database connection verified
echo.

echo Step 5: Opening Prisma Studio...
echo    Prisma Studio will open at http://localhost:5555
echo    You can view/edit database records there
echo.
set /p OPEN_STUDIO="Open Prisma Studio? (y/n) "
if /i "%OPEN_STUDIO%"=="y" (
    call npx prisma studio
)

echo.
echo ================================
echo [OK] Database Setup Complete!
echo ================================
echo.
echo Next steps:
echo   1. Run: npm run start:dev
echo   2. Test API at: http://localhost:3000/api
echo.
pause
