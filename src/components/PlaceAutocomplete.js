import { useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const PlaceAutocomplete = ({ onSelect }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    let autocomplete;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (inputRef.current) {
        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment'], // Limit results to establishments
          fields: ['geometry', 'name', 'formatted_address', 'place_id', 'address_components'], // Include geometry to get lat and lon
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          // Ensure that geometry exists and extract lat/lon
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lon = place.geometry.location.lng();
            
            // Extract city and state using helper function
            const { city, state } = getCityAndState(place);

            // Pass the lat, lon, place, city, and state to the parent component
            onSelect({
              place,
              lat,
              lon,
              city,
              state
            });
          }
        });
      }
    });

    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter a business or place"
      className="p-2 border rounded w-full max-w-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

// Helper function to extract city and state from address_components
const getCityAndState = (place) => {
  let city = '';
  let state = '';

  if (place.address_components) {
    place.address_components.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name; // City
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name; // State
      }
    });
  }

  return { city, state };
};

export default PlaceAutocomplete;
