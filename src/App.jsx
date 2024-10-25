import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { updatePlaces, fetchUserPlaces } from "./http.js";
import Error from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState();

  useEffect(() => {
    async function fetchPlaces() {
      setFetching(true);
      try {
        const palces = await fetchUserPlaces();
        setUserPlaces(palces);
      } catch (error) {
        setError({
          message:
            error.message || "Failed to fetch user places, please try again",
        });
      }
      setFetching(false);
    }

    fetchPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updatePlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdate({
        message: error.message || "Failed to update, please try again",
      });
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      await updatePlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdate({
        message: error.message || "Failed to delete, please try again",
      });
    }

    setModalIsOpen(false);
  }, []);

  function handleError() {
    setErrorUpdate(null);
  }

  return (
    <>
      <Modal open={errorUpdate} onClose={handleError}>
        {errorUpdate && (
          <Error
            title="Error"
            message={errorUpdate.message}
            onConfirm={handleError}
          />
        )}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="Error" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            loadingText={"Fetching places..."}
            isLoading={fetching}
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
