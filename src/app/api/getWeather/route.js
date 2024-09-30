import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const timestamp = searchParams.get('timestamp'); // New parameter

  if (!lat || !lon || !timestamp) {
    return NextResponse.json(
      { error: 'Latitude, longitude, and timestamp are required' },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Use the 5-day / 3-hour forecast API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenWeather API error response:', errorData);
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    console.log('OpenWeather API data:', data);

    // Find the forecast data that matches the timestamp
    const forecastData = data.list.find(item => {
      const forecastTimestamp = item.dt; // Unix timestamp
      return Math.abs(forecastTimestamp - timestamp) < 5400; // Within 1.5 hours
    });

    if (!forecastData) {
      return NextResponse.json(
        { error: 'No weather data available for the specified time' },
        { status: 404 }
      );
    }

    const temp = forecastData.main?.temp ?? null;
    const windSpeed = forecastData.wind?.speed ?? null;
    const precipitation = forecastData.weather?.[0]?.main ?? 'Clear';
    const iconCode = forecastData.weather?.[0]?.icon ?? null;

    return NextResponse.json({ temp, windSpeed, precipitation, iconCode });
  } catch (error) {
    console.error('Error in getWeather API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}