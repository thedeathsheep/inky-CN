@echo off
chcp 65001 >nul
cd /d "%~dp0"
set NODE_PATH=%~dp0app\node_modules
npx --yes electron app/main-process/main.js
