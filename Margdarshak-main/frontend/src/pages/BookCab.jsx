import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function BookCab() {
  const [pickup, setPickup] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destination, setDestination] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const pickupRef = useRef(null);
  const destinationRef = useRef(null);

  const navigate = useNavigate();

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Failed to fetch suggestions", err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(pickup, setPickupSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [pickup]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(destination, setDestinationSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [destination]);

  const renderSuggestions = (suggestions, setInput) =>
    suggestions.length ? (
      <ul className="border bg-white max-h-48 overflow-auto rounded-md shadow-lg absolute z-10 w-full">
        {suggestions.map((s) => (
          <li
            key={s.place_id}
            className="p-2 hover:bg-blue-500 hover:text-white cursor-pointer"
            onClick={() => {
              setInput(s.display_name);
              setPickupSuggestions([]);
              setDestinationSuggestions([]);
            }}
          >
            {s.display_name}
          </li>
        ))}
      </ul>
    ) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup || !destination) {
      alert("Please enter both pickup and destination.");
      return;
    }
    // Redirect to /route-map page, passing pickup & destination as state
    navigate("/route-map", { state: { pickup, destination } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🚖 Book a Cab</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md mb-6 relative">
        <div className="mb-6 relative">
          <label className="block text-gray-700 font-semibold mb-2">Pickup Location</label>
          <div className="flex">
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup point"
              className="flex-grow p-3 border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={pickupRef}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
                    const res = await fetch(revUrl);
                    const data = await res.json();
                    if (data.display_name) setPickup(data.display_name);
                    else setPickup(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                  });
                } else {
                  alert("Geolocation not supported");
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-xl"
              title="Use current location"
            >
              📍
            </button>
          </div>
          {pickup && renderSuggestions(pickupSuggestions, setPickup)}
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 font-semibold mb-2">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            ref={destinationRef}
            autoComplete="off"
          />
          {destination && renderSuggestions(destinationSuggestions, setDestination)}
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default BookCab;
