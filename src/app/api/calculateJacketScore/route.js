// src/app/api/calculateJacketScore/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { temperature, windSpeed, precipitation, venueType } = await request.json();

    let score = 0;

    // Temperature scoring
    if (temperature < 50) score += 50;
    else if (temperature < 65) score += 30;
    else if (temperature < 75) score += 10;

    // Wind speed scoring
    if (windSpeed > 15) score += 20;
    else if (windSpeed > 5) score += 10;

    // Precipitation scoring
    if (['Rain', 'Snow', 'Drizzle', 'Thunderstorm'].includes(precipitation)) score += 20;

    // Venue type scoring
    if (venueType === 'Outdoors') score += 10;
    else if (venueType === 'Indoors') score -= 10;

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({ score });
  } catch (error) {
    console.error('Error in calculateJacketScore API route:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}