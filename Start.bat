@echo off
title Edit By Kuju - DiscordBot

echo Press any key to start the server
pause > nul
CLS

echo Starting
if not exist node_modules (
npm install
node ./index.js
) else (
node ./index.js
)
