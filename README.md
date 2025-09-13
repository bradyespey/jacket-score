# JacketScore
**Scope**: This README replaces prior selected overview docs

## Overview
Web application that helps users decide whether they need a jacket based on weather conditions, location, venue type, arrival time, duration, and personal preferences. Combines real-time weather data with AI-generated recommendations to provide a personalized jacket score (0-100%) and tailored advice.

## Live and Admin
- 🌐 **App URL**: https://jacketscore.com
- 🚀 **Vercel Dashboard**: Connected to GitHub for continuous deployment
- 🌍 **Domain**: jacketscore.com (purchased via GoDaddy)
- 📧 **Comments**: Email notifications via Gmail OAuth2 to YOUR_EMAIL
- 📊 **Analytics**: Usage tracking and performance monitoring

## Tech Stack
- ⚛️ **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- 🎨 **UI**: Responsive design with dark mode support
- 🚀 **Hosting**: Vercel with serverless functions
- 🗺️ **Location**: Google Places API with autocomplete
- 🌤️ **Weather**: OpenWeather API (5-day/3-hour forecasts)
- 🤖 **AI**: OpenAI ChatGPT API for personalized recommendations
- 📧 **Email**: Nodemailer with Gmail OAuth2 for comment system

## Quick Start
```bash
git clone https://github.com/bradyespey/jacket-score
cd JacketScore
npm install
npm run dev
```

## Environment
Required environment variables:

```env
# Google Places API
NEXT_PUBLIC_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY

# Weather Data
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY

# AI Recommendations
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Email System (Gmail OAuth2)
GMAIL_USER=YOUR_GMAIL_USER
GMAIL_CLIENT_ID=YOUR_GMAIL_CLIENT_ID
GMAIL_CLIENT_SECRET=YOUR_GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN=YOUR_GMAIL_REFRESH_TOKEN
```

## Run Modes (Debug, Headless, Profiles)
- 🐛 **Debug Mode**: `npm run dev` with console logs for API calls and data handling
- 🌐 **Production Mode**: Deployed on Vercel with environment variables
- 📱 **Mobile Mode**: Responsive design optimized for mobile devices

## Scripts and Ops
- 🔧 **Development**: `npm run dev` — Start local development server at localhost:3000
- 🏗️ **Build**: `npm run build` — Next.js production build
- 🚀 **Start**: `npm start` — Start production server
- 🔍 **Lint**: `npm run lint` — ESLint code checking
- 📦 **Deploy**: Automatic via GitHub integration to Vercel

## Deploy
- 🚀 **Platform**: Vercel connected to GitHub repository
- 📦 **Build Command**: `npm run build`
- 📁 **Output Directory**: `.next`
- 🌐 **Domains**: jacketscore.com (primary), vercel app domain
- 🔄 **CI/CD**: Automatic deployment on GitHub push

## App Pages / Routes
- 🏠 **Main Page** (`/`): Location input, venue type, arrival time, duration, gender selection with Google Places autocomplete
- 📊 **Results**: Jacket score display with progress bar, weather information, AI recommendation, and edit inputs option
- 📧 **Comments**: Integrated comment system with email notifications

## 🤖 How It Works

1. **User Inputs:**
   - Select location, venue type, arrival time, duration, and optionally, gender
2. **Weather Fetching:**
   - Retrieves weather data for the selected time and location
3. **AI Recommendation:**
   - Sends data to OpenAI API for a personalized recommendation
4. **Jacket Score Calculation:**
   - Calculates a score from 0-100% indicating the need for a jacket
5. **Results Display:**
   - Shows the jacket score, AI recommendation, and weather information

## Directory Map
```
JacketScore/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── calculateJacketScore/    # Jacket score calculation logic
│   │   │   ├── getChatGPTRecommendation/ # OpenAI API integration
│   │   │   ├── getWeather/              # OpenWeather API calls
│   │   │   └── submitComment/           # Email notification system
│   │   ├── page.js                      # Main frontend with state handling
│   │   └── layout.js                    # App layout and global styles
│   └── components/
│       ├── PlaceAutocomplete.js         # Google Places autocomplete with city/state
│       └── JacketScore.js               # Score display component
├── public/images/                       # App logos and screenshots
└── tailwind.config.js                  # Tailwind CSS configuration
```

## Troubleshooting
- 🔑 **API Keys**: Ensure all environment variables are properly set in Vercel
- 🗺️ **Location Issues**: Google Places API restricted to localhost and jacketscore.com domains
- 🌤️ **Weather Data**: OpenWeather API rounds temperature/wind to whole numbers, matches 3-hour intervals
- 🤖 **AI Responses**: ChatGPT prompts include optional gender, city, state based on user input
- 📧 **Email System**: Gmail OAuth2 requires proper GCP setup with authorized redirect URIs
- 📱 **Mobile UI**: Button centering and responsive design optimized for mobile devices

## AI Handoff
Read this README, scan the repo, prioritize core functions and env-safe areas, keep env and rules aligned with this file. Focus on weather API integration, AI recommendation logic, and jacket score calculation algorithms.