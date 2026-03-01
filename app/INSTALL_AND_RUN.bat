@echo off
chcp 65001 >nul
echo Inky: Installing dependencies and starting...
cd /d "%~dp0"

if exist node_modules\electron (
    echo Removing old node_modules...
    rmdir /s /q node_modules
    if exist node_modules (
        echo Failed to remove node_modules. Please close Cursor/IDE and try again.
        pause
        exit /b 1
    )
)

set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
echo Running npm install...
call npm install
if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
)

echo Starting Inky...
call npm start
