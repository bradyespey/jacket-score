"use client";

import Image from "next/image";
import { useState } from "react";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import JacketScore from "../components/JacketScore";
import ClipLoader from "react-spinners/ClipLoader";

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [venueType, setVenueType] = useState("Unknown");
  const [duration, setDuration] = useState(1);
  const [arrivalTime, setArrivalTime] = useState(""); // New state for arrival time
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [jacketScore, setJacketScore] = useState(null);
  const [showResults, setShowResults] = useState(false); // To toggle between input and results

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setErrorMessage("");
    console.log("Selected Place:", place);
  };

  // Function to fetch weather data from your API
  const fetchWeather = async (lat, lon, timestamp) => {
    try {
      const response = await fetch(
        `/api/getWeather?lat=${lat}&lon=${lon}&timestamp=${timestamp}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch weather data");
      }
      const data = await response.json();
      console.log("Fetched Weather Data:", data); // Log the response to check structure
      setWeatherData(data); // Save the weather data
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setErrorMessage(error.message);
      return null;
    }
  };

  const handleJacketScore = async () => {
    if (selectedPlace) {
      setIsLoading(true); // Start loading
      setErrorMessage(""); // Clear any previous errors
      setRecommendation(null);
      setJacketScore(null);

      const lat = selectedPlace.geometry?.location.lat();
      const lon = selectedPlace.geometry?.location.lng();

      console.log("Latitude:", lat);
      console.log("Longitude:", lon);

      // Calculate the timestamp for the arrival time
      const now = new Date();
      const [hours, minutes] = arrivalTime.split(":");
      const arrivalDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );
      const arrivalTimestamp = Math.floor(arrivalDateTime.getTime() / 1000);

      // Fetch the weather data based on selected place's coordinates and arrival time
      const weather = await fetchWeather(lat, lon, arrivalTimestamp);

      if (weather) {
        // Prepare data for ChatGPT
        const chatGPTBody = {
          location: selectedPlace.name,
          time: arrivalTime,
          duration,
          temperature: weather.temp,
          wind: weather.windSpeed,
          precipitation: weather.precipitation,
          venueType,
        };

        // Fetch recommendation from ChatGPT
        try {
          const response = await fetch("/api/getChatGPTRecommendation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chatGPTBody),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Failed to fetch recommendation"
            );
          }

          const data = await response.json();
          console.log("ChatGPT Recommendation:", data.recommendation);
          setRecommendation(data.recommendation);
        } catch (error) {
          console.error("Error fetching ChatGPT recommendation:", error);
          setErrorMessage(error.message);
        }

        // Prepare data for jacket score calculation
        const scoreBody = {
          temperature: weather.temp,
          windSpeed: weather.windSpeed,
          precipitation: weather.precipitation,
          venueType,
        };

        // Fetch the jacket score
        try {
          const response = await fetch("/api/calculateJacketScore", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(scoreBody),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Failed to calculate jacket score"
            );
          }

          const data = await response.json();
          console.log("Jacket Score:", data.score);
          setJacketScore(data.score);
        } catch (error) {
          console.error("Error calculating jacket score:", error);
          setErrorMessage(error.message);
        }
      }

      setIsLoading(false); // End loading
      setShowResults(true); // Show the results section
    } else {
      alert("Please select a place first.");
    }
  };

  const handleEdit = () => {
    // Reset the results and show the input form again
    setShowResults(false);
    setErrorMessage("");
  };

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans dark:bg-black dark:text-white">
      <main className="flex flex-col gap-8 items-center sm:items-start w-full max-w-lg">
        <Image
          src="/images/jacketscore-logo.png"
          alt="JacketScore logo"
          width={450}
          height={95}
          priority
        />
        <h1 className="text-3xl font-bold mb-4">JacketScore</h1>
        <p className="mb-4 text-center sm:text-left">
          Find out if you need a jacket for your outing!
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 text-red-500">
            <p>Error: {errorMessage}</p>
          </div>
        )}

        {!showResults ? (
          <>
            {/* Input Form */}
            {/* Google Places Autocomplete */}
            <PlaceAutocomplete onSelect={handlePlaceSelect} />

            {selectedPlace && (
              <div className="mt-4 w-full">
                <h2 className="text-2xl">Selected Place</h2>
                <p>Name: {selectedPlace.name}</p>
                <p>Address: {selectedPlace.formatted_address}</p>
              </div>
            )}

            {/* Venue Type */}
            <div className="mt-4 w-full">
              <label className="block mb-2">
                Are you staying indoors or outdoors?
              </label>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                className="p-2 border rounded w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unknown">Unknown</option>
                <option value="Indoors">Indoors</option>
                <option value="Outdoors">Outdoors</option>
              </select>
            </div>

            {/* Arrival Time */}
            <div className="mt-4 w-full">
              <label className="block mb-2">What time are you arriving?</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="p-2 border rounded w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration */}
            <div className="mt-4 w-full">
              <label className="block mb-2">
                How long will you be staying? (hours)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="p-2 border rounded w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Get Jacket Score Button */}
            <div className="mt-4 w-full">
              <button
                className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                onClick={handleJacketScore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ClipLoader size={20} color={"#ffffff"} loading={isLoading} />
                    <span className="ml-2">Calculating...</span>
                  </>
                ) : (
                  "Get Jacket Score"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Results Section */}
            <div className="mt-4 w-full">
              <h2 className="text-2xl">Your Jacket Score</h2>
              {jacketScore !== null && <JacketScore score={jacketScore} />}
              {recommendation && (
                <div className="mt-4">
                  <h2 className="text-2xl">Recommendation</h2>
                  <p>{recommendation}</p>
                </div>
              )}
              {/* Weather Data */}
              {weatherData && (
                <div className="mt-4">
                  <h2 className="text-2xl">Weather Information</h2>
                  {weatherData.iconCode && (
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.iconCode}@2x.png`}
                      alt={weatherData.precipitation}
                    />
                  )}
                  <p>
                    Temperature:{" "}
                    {weatherData.temp !== null
                      ? `${Math.round(weatherData.temp)}°F`
                      : "N/A"}
                  </p>
                  <p>
                    Wind Speed:{" "}
                    {weatherData.windSpeed !== null
                      ? `${Math.round(weatherData.windSpeed)} mph`
                      : "N/A"}
                  </p>
                  <p>
                    Precipitation: {weatherData.precipitation ?? "N/A"}
                  </p>
                </div>
              )}
              {/* Edit Button */}
              <div className="mt-4 w-full">
                <button
                  className="bg-gray-500 text-white p-2 rounded w-full hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
