import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Recenter({ coords }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) {
      map.setView(coords, 14);
    }
  }, [coords, map]);
  return null;
}

const mechanicIcon = new L.DivIcon({
  html: `<div style="font-size: 24px; color: #e74c3c;">🔧</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const QuickVehicleSupport = () => {
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMechanicMap, setShowMechanicMap] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (locationInput.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationInput
      )}&addressdetails=1&limit=5`;
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [locationInput]);

  const handleSuggestionClick = (place) => {
    setLocationInput(place.display_name);
    setShowSuggestions(false);
    const coords = [parseFloat(place.lat), parseFloat(place.lon)];
    setUserCoords(coords);
    fetchNearbyMechanics(coords);
  };

  // Fetch mechanics using Overpass API
  const fetchNearbyMechanics = async (coords) => {
    setLoading(true);
    try {
      const [lat, lon] = coords;
      const query = `
        [out:json][timeout:25];
        (
          node["shop"="car_repair"](around:5000,${lat},${lon});
          way["shop"="car_repair"](around:5000,${lat},${lon});
          relation["shop"="car_repair"](around:5000,${lat},${lon});
          node["amenity"="mechanic"](around:5000,${lat},${lon});
        );
        out center;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();

      const mechanicsData = data.elements
        .map((el) => {
          if (el.type === "node") {
            return { id: el.id, lat: el.lat, lon: el.lon, tags: el.tags };
          }
          if (el.type === "way" || el.type === "relation") {
            return {
              id: el.id,
              lat: el.center.lat,
              lon: el.center.lon,
              tags: el.tags,
            };
          }
          return null;
        })
        .filter(Boolean);

      setMechanics(mechanicsData);
      setShowMechanicMap(true);
    } catch {
      alert("Failed to fetch nearby mechanics");
      setMechanics([]);
      setShowMechanicMap(false);
    }
    setLoading(false);
  };

  // Find mechanics near current location or manual input
  const findMechanicsNearby = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setLocationInput("");
        fetchNearbyMechanics(coords);
      },
      () => {
        alert("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  // Search by manual input (geocode string to coords + fetch)
  const searchByInput = async () => {
    if (!locationInput) return alert("Enter a location to search");
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationInput
      )}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.length === 0) throw new Error("Location not found");
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      setUserCoords(coords);
      fetchNearbyMechanics(coords);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">🛠️ Quick Vehicle Support</h1>

      <div className="relative w-full max-w-md mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Enter your location"
          className="flex-grow border border-gray-300 rounded-lg p-3"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onFocus={() => locationInput.length >= 3 && setShowSuggestions(true)}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowSuggestions(false);
              searchByInput();
            }
          }}
        />
        <button
          className="bg-blue-600 text-white rounded-lg px-4 font-semibold"
          onClick={searchByInput}
          title="Search Location"
        >
          🔍
        </button>

        <button
          className="bg-green-600 text-white rounded-lg px-4 font-semibold"
          onClick={findMechanicsNearby}
          title="Use Current Location"
        >
          📍
        </button>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full max-w-md overflow-auto rounded border border-gray-300 bg-white shadow-lg">
            {suggestions.map((place) => (
              <li
                key={place.place_id}
                className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                onMouseDown={() => handleSuggestionClick(place)}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button className="p-4 bg-yellow-500 text-white font-semibold rounded-xl shadow-md hover:bg-yellow-600">
          🛠️ Mechanic Help
        </button>
        <button className="p-4 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-600">
          🚛 Tow Help
        </button>
      </div>

      {loading && <p className="mt-4 font-semibold text-blue-600">Loading...</p>}

      {/* Show map only if mechanics found */}
      {showMechanicMap && userCoords && (
        <div className="mt-6 w-full max-w-4xl h-96 rounded-lg shadow-lg overflow-hidden">
          <MapContainer center={userCoords} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Recenter coords={userCoords} />
            <Marker position={userCoords}>
              <Popup>Your Location</Popup>
            </Marker>
            {mechanics.map((mech) => (
              <Marker key={mech.id} position={[mech.lat, mech.lon]} icon={mechanicIcon}>
                <Popup>
                  {mech.tags?.name || "Mechanic"}
                  <br />
                  {mech.tags?.operator && <span>Operator: {mech.tags.operator}</span>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default QuickVehicleSupport;
