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
          fields: ['geometry', 'name', 'formatted_address', 'place_id'], // Request necessary fields
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          onSelect(place);
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

export default PlaceAutocomplete;