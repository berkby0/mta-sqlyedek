@echo off
title Berk Mta Sql Yedekleme
color 0b

echo ===================================================
echo           Berk Mta Sql Yedekleme Baslatiliyor        
echo ===================================================
echo.

:start
node index.js
echo.
echo [UYARI] Bot kapandi veya hata verdi! 5 saniye icinde yeniden baslatiliyor...
timeout /t 5 /nobreak >nul
goto start