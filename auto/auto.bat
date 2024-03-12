@echo off

if not exist ./inject/discord.js (
    set /p apiKey=YT Music Client requires a Discord App key. Paste yours now: 
    if "%apiKey%" == "" (
        echo No app key provided, could not start application
    ) else (
        echo const DISCORD_APP_ID = "%apiKey%"\r\n >> ./inject/discord.js
        echo module.exports = { DISCORD_APP_ID; }\r\n >> ./inject/discord.js
    )
)