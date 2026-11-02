@echo off
setlocal

node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js no esta instalado. Instala Node.js 24 LTS o superior.
  exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop no esta instalado o no esta iniciado.
  exit /b 1
)

node "%~dp0scripts\setup.js"
exit /b %errorlevel%
