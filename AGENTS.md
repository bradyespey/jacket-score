# Project Context

Read README.md for full project context before making changes.

## Overview
Weather-based jacket recommendation app that computes a jacket score and AI advice based on location, timing, venue, and user preferences.

## Stack
Next.js 14, React 18, Tailwind CSS, OpenWeather API, Google Places API, OpenAI API, Nodemailer/Gmail OAuth2, Vercel.

## Key Files
- src/app/api/calculateJacketScore/
- src/app/api/getChatGPTRecommendation/
- src/app/api/getWeather/
- src/app/api/submitComment/
- src/components/PlaceAutocomplete.js
- src/components/JacketScore.js

## Dev Commands
- Start: npm run dev
- Build: npm run build
- Deploy: automatic on GitHub push to Vercel

## Local Ports
- App dev: `http://localhost:3000`
- Netlify local shell: not used for this repo

## Rules
- Do not introduce new frameworks
- Follow existing structure and naming
- Keep solutions simple and fast

## Notes
- Preserve API route separation for weather, score, and recommendation logic.
- Ensure Gmail OAuth2 comment notification flow remains functional.
