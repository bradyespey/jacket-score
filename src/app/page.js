"use client";

import Image from "next/image";
import { useState } from "react";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import JacketScore from "../components/JacketScore";
import ClipLoader from "react-spinners/ClipLoader";

export default function Home() {
  const now = new Date();

  // Generate an array of times for the next 12 hours
  const hoursArray = [...Array(12).keys()].map((i) => {
    const newHour = new Date(now.getTime() + i * 60 * 60 * 1000);
    return newHour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [lat, setLat] = useState(null);   // State for latitude
  const [lon, setLon] = useState(null);   // State for longitude
  const [city, setCity] = useState("");   // New state for city
  const [state, setState] = useState(""); // New state for state
  const [venueType, setVenueType] = useState("");
  const [duration, setDuration] = useState(1);
  const [arrivalTime, setArrivalTime] = useState(hoursArray[0]); // Set initial arrival time
  const [gender, setGender] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [jacketScore, setJacketScore] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // New states for handling comments
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState("");

  const handlePlaceSelect = ({ place, lat, lon, city, state }) => {
    setSelectedPlace(place);
    setLat(lat);     // Store latitude
    setLon(lon);     // Store longitude
    setCity(city);   // Store city
    setState(state); // Store state
    setErrorMessage("");
  };

  const handleVenueTypeSelect = (type) => setVenueType(type);
  const handleGenderSelect = (selectedGender) => setGender(selectedGender);

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
      // Round temperature and wind speed
      data.temp = Math.round(data.temp);
      data.windSpeed = Math.round(data.windSpeed);
      setWeatherData(data); // Save the weather data
      return data;
    } catch (error) {
      setErrorMessage(error.message);
      return null;
    }
  };

  // Round to nearest 3-hour interval
  const roundToNearestThreeHours = (date) => {
    const msInThreeHours = 3 * 60 * 60 * 1000;
    return new Date(Math.round(date.getTime() / msInThreeHours) * msInThreeHours);
  };

  const handleJacketScore = async () => {
    if (selectedPlace && venueType && arrivalTime && duration && gender && lat && lon) {
      setIsLoading(true); // Start loading
      setErrorMessage(""); // Clear any previous errors
      setRecommendation(null);
      setJacketScore(null);

      // Parse arrivalTime
      const now = new Date();
      let arrivalDateTime = new Date(`${now.toDateString()} ${arrivalTime}`);

      // If arrivalDateTime is earlier than now, add one day
      if (arrivalDateTime < now) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }

      // Round the arrival time to the nearest 3-hour interval
      const roundedArrivalTime = roundToNearestThreeHours(arrivalDateTime);
      const arrivalTimestamp = Math.floor(roundedArrivalTime.getTime() / 1000);

      console.log("Now:", now);
      console.log("ArrivalDateTime:", arrivalDateTime);
      console.log("RoundedArrivalTime:", roundedArrivalTime);
      console.log("ArrivalTimestamp:", arrivalTimestamp);

      // Fetch the weather data based on selected place's coordinates and rounded arrival time
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
          city,   // Include city
          state,  // Include state
        };

        // Add gender if it's not "Prefer Not to Say"
        if (gender !== "Prefer Not to Say") {
          chatGPTBody.gender = gender;
        }

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
            throw new Error(errorData.error || "Failed to fetch recommendation");
          }

          const data = await response.json();
          setRecommendation(data.recommendation);
        } catch (error) {
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
            throw new Error(errorData.error || "Failed to calculate jacket score");
          }

          const data = await response.json();
          setJacketScore(data.score);
        } catch (error) {
          setErrorMessage(error.message);
        }
      }

      setIsLoading(false); // End loading
      setShowResults(true); // Show the results section
    } else {
      alert("Please fill in all the required fields.");
    }
  };

  const handleEdit = () => {
    setShowResults(false);
    setErrorMessage("");
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCommentError("");
    setCommentSuccess(false);

    if (!comment.trim()) {
      setCommentError("Please enter a comment.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/submitComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit comment");
      }

      setCommentSuccess(true);
      setComment(""); // Clear comment input after successful submission
    } catch (error) {
      setCommentError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonClass = (isSelected) => {
    return `button ${isSelected ? "selected" : ""} text-center`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 font-sans dark:bg-black dark:text-white">
      <main className="flex flex-col gap-8 items-center w-full max-w-lg text-center">
        {/* Image */}
        <Image
          src="/images/jacketscore-logo.png"
          alt="JacketScore logo"
          width={175} // Smaller logo size
          height={40}
          priority
        />

        {!showResults && (
          <>
            <h1 className="text-4xl font-extrabold mb-4">Do You Need a Jacket?</h1>
            <p className="mb-4">
              Use JacketScore, powered by AI, to decide if you&apos;ll need a jacket based on your
              location, weather, and duration of stay.
            </p>
          </>
        )}

        {errorMessage && (
          <div className="mt-4 text-red-500">
            <p>Error: {errorMessage}</p>
          </div>
        )}

        {!showResults ? (
          <>
            {/* Google Places Autocomplete */}
            <div className="w-full text-left">
              <label className="block mb-2 text-lg font-semibold text-center">
                Where are you going?
              </label>
              <PlaceAutocomplete onSelect={handlePlaceSelect} />
            </div>

            {/* Venue Type Buttons */}
            <div className="mt-6 w-full">
              <label className="block mb-2 text-lg font-semibold">
                Are you staying indoors or outdoors?
              </label>
              <div className="flex space-x-4 justify-center">
                <button
                  className={getButtonClass(venueType === "Indoors")}
                  onClick={() => handleVenueTypeSelect("Indoors")}
                >
                  <span className="button-content">Indoors</span>
                </button>
                <button
                  className={getButtonClass(venueType === "Outdoors")}
                  onClick={() => handleVenueTypeSelect("Outdoors")}
                >
                  <span className="button-content">Outdoors</span>
                </button>
              </div>
            </div>

            {/* Arrival Time Slider */}
            <div className="mt-6 w-full">
              <label className="block mb-2 text-lg font-semibold">What time are you arriving?</label>
              <input
                type="range"
                min="0"
                max="11"
                value={hoursArray.indexOf(arrivalTime)}
                onChange={(e) => setArrivalTime(hoursArray[e.target.value])}
                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
              />
              <div className="text-center text-sm mt-2 font-semibold">
                Arrival Time: {arrivalTime || hoursArray[0]}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="mt-6 w-full">
              <label className="block mb-2 text-lg font-semibold">
                How long will you be staying? (hours)
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
              />
              <div className="text-center text-sm mt-2 font-semibold">Duration: {duration} hours</div>
            </div>

            {/* Gender Selection */}
            <div className="mt-6 w-full">
              <label className="block mb-2 text-lg font-semibold">What is your gender?</label>
              <div className="flex space-x-4 justify-center">
                <button
                  className={getButtonClass(gender === "Male")}
                  onClick={() => handleGenderSelect("Male")}
                >
                  <span className="button-content">Male</span>
                </button>
                <button
                  className={getButtonClass(gender === "Female")}
                  onClick={() => handleGenderSelect("Female")}
                >
                  <span className="button-content">Female</span>
                </button>
                <button
                  className={getButtonClass(gender === "Prefer Not to Say")}
                  onClick={() => handleGenderSelect("Prefer Not to Say")}
                >
                  <span className="button-content">Prefer Not to Say</span>
                </button>
              </div>
            </div>

            {/* Get Jacket Score Button */}
            <div className="mt-6 w-full">
              <button
                className="button w-full flex items-center justify-center"
                onClick={handleJacketScore}
                disabled={isLoading}
              >
                <span className="button-content">
                  {isLoading ? (
                    <>
                      <ClipLoader size={20} color={"#ffffff"} loading={isLoading} />
                      <span className="ml-2">Calculating...</span>
                    </>
                  ) : (
                    "Get Jacket Score"
                  )}
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Results Section */}
            <div className="mt-4 w-full">
              <h2 className="text-4xl font-extrabold">Your Jacket Score</h2>
              {jacketScore !== null && <JacketScore score={jacketScore} />}
              {recommendation && (
                <div className="mt-4">
                  <h2 className="text-2xl">Recommendation</h2>
                  <p>{recommendation}</p>
                </div>
              )}
              {weatherData && (
                <div className="mt-4">
                  <h2 className="text-2xl">Weather Information</h2>
                  <div className="flex flex-col items-center">
                    {weatherData.iconCode && (
                      <Image
                        src={`https://openweathermap.org/img/wn/${weatherData.iconCode}@2x.png`}
                        alt={weatherData.precipitation}
                        width={100}
                        height={100}
                      />
                    )}
                    <p>
                      Temperature:{" "}
                      {weatherData.temp !== null ? `${weatherData.temp}°F` : "N/A"}
                    </p>
                    <p>
                      Wind Speed:{" "}
                      {weatherData.windSpeed !== null ? `${weatherData.windSpeed} mph` : "N/A"}
                    </p>
                    <p>Precipitation: {weatherData.precipitation ?? "N/A"}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 w-full">
                <button className={getButtonClass(false)} onClick={handleEdit}>
                  <span className="button-content">Edit Inputs</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Comment Section */}
        <section className="mt-8 w-full">
          <h2 className="text-2xl font-bold mb-4">Leave a Comment</h2>
          <form onSubmit={handleCommentSubmit} className="w-full text-left">
            <textarea
              className="w-full h-32 p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              placeholder="Share your thoughts about JacketScore..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            {commentError && <p className="text-red-500 mt-2">{commentError}</p>}
            {commentSuccess && <p className="text-green-500 mt-2">Comment submitted successfully!</p>}
            
            {/* Apply margin-top directly to the button */}
            <button
              className="mt-4 button w-full flex items-center justify-center bg-gray-700 text-white rounded-full py-2 px-4 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 transition-all duration-300 ease-in-out"
              onClick={handleCommentSubmit}
              disabled={isSubmitting}
            >
              <span className="button-content">
                {isSubmitting ? "Submitting..." : "Submit Comment"}
              </span>
            </button>
          </form>
        </section>

        {/* Attribution for the Icons and Buttons */}
        <footer className="text-center text-sm mt-8">
          <p>
            Icons made by{" "}
            <a
              href="https://www.flaticon.com/free-icons/puffer-coat"
              title="puffer coat icons"
              className="text-blue-500 hover:underline"
            >
              Iconic Panda
            </a>{" "}
            from{" "}
            <a
              href="https://www.flaticon.com/"
              title="Flaticon"
              className="text-blue-500 hover:underline"
            >
              Flaticon
            </a>
          </p>
          <p>
            Button design inspiration from{" "}
            <a
              href="https://uiverse.io/Madflows/stale-baboon-45"
              title="Uiverse Button Design"
              className="text-blue-500 hover:underline"
            >
              Madflows on Uiverse.io
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
