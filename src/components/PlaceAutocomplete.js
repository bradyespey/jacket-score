import { useRef, useEffect } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const PlaceAutocomplete = ({ onSelect }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    let autocomplete;
    let placeChangedListener;
    let isMounted = true;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) return undefined;

    setOptions({ key: apiKey });

    importLibrary('places').then(({ Autocomplete }) => {
      if (inputRef.current && isMounted) {
        autocomplete = new Autocomplete(inputRef.current, {
          types: ['establishment'], // Limit results to establishments
          fields: ['geometry', 'name', 'formatted_address', 'place_id', 'address_components'], // Include geometry to get lat and lon
        });

        placeChangedListener = autocomplete.addListener('place_changed', () => {
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
    }).catch((error) => {
      console.error('Failed to load Google Places autocomplete', error);
    });

    return () => {
      isMounted = false;
      placeChangedListener?.remove();
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter a business or place"
      className="p-2 border border-gray-300 rounded w-full max-w-lg text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
