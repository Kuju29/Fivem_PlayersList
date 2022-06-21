@echo off
title Edit By Kuju - DiscordBot

echo Press any key to start the server
pause > nul
CLS

echo Starting
if not exist node_modules (
npm install
npm start
node ./index.js
) else (
pnpm start
node ./index.js
)
