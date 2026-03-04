@echo off
cd /d "%~dp0"
pnpm run build && pnpm run preview
