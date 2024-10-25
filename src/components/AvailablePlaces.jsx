import { useState } from "react";
import Places from "./Places.jsx";
import { useEffect } from "react";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";



export default function AvailablePlaces({ onSelectPlace }) {
  const [fetching, setFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchPlaces() {
      setFetching(true);
      try {
       const places = await fetchAvailablePlaces()
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          );
          setAvailablePlaces(sortedPlaces);  
          setFetching(false);
        });
      } catch (error) {
        setError({
          message: error.message || "Could not fetch, please try again",
        });
        setFetching(false);
      }

   
    }
    fetchPlaces();
  }, []);

  if (error) {
    return <Error title="Error" message={error.message}></Error>;
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={fetching}
      loadingText={"Fetching palces data..."}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
