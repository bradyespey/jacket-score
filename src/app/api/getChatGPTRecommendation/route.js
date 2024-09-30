// src/app/api/getChatGPTRecommendation/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    console.log('Received body:', body); // Log incoming body for debugging

    // Destructure the request body to include city and state
    const {
      location,
      time,
      duration,
      temperature,
      wind,
      precipitation,
      venueType,
      gender,
      city,    // Add city
      state,   // Add state
    } = body;

    // Validate that all required fields are present
    if (
      !location ||
      !time ||
      !duration ||
      temperature === undefined ||
      wind === undefined ||
      !precipitation ||
      !venueType
    ) {
      console.error('Invalid request body:', body);
      return NextResponse.json(
        { error: 'Missing or invalid data in request body.' },
        { status: 400 }
      );
    }

    // Parse numerical values and round to whole numbers
    const parsedTemperature = Math.round(parseFloat(temperature));
    const parsedWind = Math.round(parseFloat(wind));
    const parsedDuration = parseInt(duration, 10);

    // Validate parsed values
    if (isNaN(parsedTemperature) || isNaN(parsedWind) || isNaN(parsedDuration)) {
      console.error('Invalid number format:', { temperature, wind, duration });
      return NextResponse.json(
        { error: 'Invalid number format for temperature, wind, or duration.' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Construct the prompt, including city and state if provided
    let prompt = `I'm going to ${location}`;
    
    // Include city and state if available
    if (city && state) {
      prompt += ` in ${city}, ${state}`;
    }

    prompt += ` at ${time} and staying ${venueType}. The weather will be ${parsedTemperature} degrees F and ${precipitation} with ${parsedWind} mph wind when I arrive. I plan to stay for ${parsedDuration} hours.`;

    // Add gender to the prompt if provided
    if (gender && gender !== "Prefer Not to Say") {
      prompt = `I'm a ${gender} and ` + prompt.slice(4);
    }

    prompt += ` Do I need to bring a jacket? Provide a brief recommendation.`;

    // Log the prompt and payload for debugging
    console.log('Payload being sent to OpenAI:', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    // Make the OpenAI API request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4' if you have access
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    // Extract recommendation from the response
    const recommendation = response.choices[0].message.content.trim();
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Error in getChatGPTRecommendation API route:', error);

    // Handle OpenAI-specific error
    if (error.response) {
      console.error('OpenAI error response:', JSON.stringify(error.response.data, null, 2));
      return NextResponse.json(
        { error: error.response.data.error.message },
        { status: error.response.status }
      );
    }

    // General error fallback
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
