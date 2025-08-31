import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Animate charging icon
const chargingIcon = new L.DivIcon({
  html: `<div class="ev-icon">⚡</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Inject CSS animation for icon
const addIconAnimationCSS = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .ev-icon {
      font-size: 28px;
      color: #0d47a1;
      text-shadow: 0 0 5px #0d47a1, 0 0 10px #0d47a1;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); text-shadow: 0 0 5px #0d47a1, 0 0 10px #0d47a1; }
      50% { transform: scale(1.3); text-shadow: 0 0 15px #0d47a1, 0 0 20px #0d47a1; }
      100% { transform: scale(1); text-shadow: 0 0 5px #0d47a1, 0 0 10px #0d47a1; }
    }
  `;
  document.head.appendChild(style);
};

// To recenter map on coords change
function Recenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

// Calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) =>
  (L.latLng(lat1, lon1).distanceTo([lat2, lon2]) / 1000).toFixed(2);

const EVChargingMap = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchCoords, setSearchCoords] = useState([28.6139, 77.209]); // Delhi default
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [hoverStation, setHoverStation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDuration, setBookingDuration] = useState(1);
  const [bookingLot, setBookingLot] = useState(null);
  
  const mapRef = useRef(null);
  const routingRef = useRef(null);
  const navigate = useNavigate();

  // Your OpenRouteService API key here
  const ORS_API_KEY = "YOUR_ORS_API_KEY";

  useEffect(() => addIconAnimationCSS(), []);

  // Fetch autocomplete location suggestions
  const fetchSuggestions = async (query) => {
    if (!query) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSelectSuggestion = (place) => {
    setSearch(place.display_name);
    setSearchCoords([parseFloat(place.lat), parseFloat(place.lon)]);
    setSuggestions([]);
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchCoords([pos.coords.latitude, pos.coords.longitude]);
        setSearch("Current Location");
      },
      () => alert("Unable to fetch location")
    );
  };

  // Fetch nearby EV charging stations from OSM Overpass
  const fetchStations = async () => {
    if (!searchCoords) return;
    setLoading(true);
    try {
      const [lat, lon] = searchCoords;
      const query = `
        [out:json];
        (
          node["amenity"="charging_station"](around:5000,${lat},${lon});
          way["amenity"="charging_station"](around:5000,${lat},${lon});
          relation["amenity"="charging_station"](around:5000,${lat},${lon});
        );
        out center;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await res.json();

      const stationsWithDistance = (data.elements || []).map((station) => {
        const lat = station.lat || station.center?.lat;
        const lon = station.lon || station.center?.lon;
        const distance = getDistance(searchCoords[0], searchCoords[1], lat, lon);
        const name = station.tags?.name || station.tags?.operator || "Nearby Area";
        return { ...station, lat, lon, distance: parseFloat(distance), name };
      });

      stationsWithDistance.sort((a, b) => a.distance - b.distance);
      setStations(stationsWithDistance);
    } catch (err) {
      console.error("Error fetching stations:", err);
      alert("Failed to fetch charging stations");
    }
    setLoading(false);
  };

  // Draw route and fetch route info from ORS
  const drawRoute = async (station) => {
    if (!mapRef.current || !station) return;

    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
      setRouteInfo(null);
    }

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(searchCoords[0], searchCoords[1]),
        L.latLng(station.lat, station.lon),
      ],
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(mapRef.current);

    try {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_API_KEY,
        },
        body: JSON.stringify({
          coordinates: [
            [searchCoords[1], searchCoords[0]],
            [station.lon, station.lat],
          ],
        }),
      });
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const summary = data.features[0].properties.summary;
        setRouteInfo({
          distance: (summary.distance / 1000).toFixed(2),
          duration: (summary.duration / 60).toFixed(0),
        });
      }
    } catch (err) {
      console.error("Error fetching ORS route info:", err);
      setRouteInfo(null);
    }
  };

  useEffect(() => {
    if (hoverStation) {
      drawRoute(hoverStation);
    } else if (selectedStation) {
      drawRoute(selectedStation);
    } else {
      if (routingRef.current) {
        routingRef.current.remove();
        routingRef.current = null;
      }
      setRouteInfo(null);
    }
  }, [hoverStation, selectedStation]);

  const openBookingModal = (station) => {
    setBookingLot(station);
    setBookingDuration(1);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
  };

  const handlePayment = () => {
    const price = bookingDuration * 60; // Rs 60/hr
    navigate("/charging-payment", {
      state: {
        lot: bookingLot,
        duration: bookingDuration,
        price,
      },
    });
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h2 className="text-xl font-bold mb-4">🔌 EV Charging Finder</h2>

        {/* Search Input with Autocomplete */}
        <div className="mb-2 relative w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            placeholder="Search location..."
            className="border p-2 rounded w-full"
          />
          {suggestions.length > 0 && (
            <ul className="border rounded bg-white absolute w-full z-10 max-h-48 overflow-auto">
              {suggestions.map((place, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectSuggestion(place)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current Location & Find Stations Buttons */}
        <div className="mb-2">
          <button
            onClick={handleCurrentLocation}
            className="px-4 py-2 bg-green-600 text-white rounded mr-2"
          >
            📍 Current Location
          </button>
          <button
            onClick={fetchStations}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ⚡ Find Stations
          </button>
        </div>

        {/* Leaflet Map */}
        <MapContainer
          center={searchCoords}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <Recenter coords={searchCoords} />

          {/* User Marker */}
          <Marker position={searchCoords}>
            <Popup>{search || "Selected Location"}</Popup>
          </Marker>

          {/* EV Charging Station Markers */}
          {stations.map((station, i) => (
            <Marker
              key={i}
              position={[station.lat, station.lon]}
              icon={chargingIcon}
              eventHandlers={{
                click: () => openBookingModal(station),
                mouseover: () => setHoverStation(station),
                mouseout: () => setHoverStation(null),
              }}
            >
              <Popup>
                <strong>{station.name}</strong>
                <br />
                Distance: {station.distance} km
                {selectedStation?.lat === station.lat && routeInfo && (
                  <>
                    <br />
                    Route Distance: {routeInfo.distance} km
                    <br />
                    Estimated Time: {routeInfo.duration} mins
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Stations List */}
        {stations.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-gray-100 max-w-md">
            <h3 className="font-semibold mb-2">Closest Charging Stations:</h3>
            <ol className="list-decimal ml-4">
              {stations.map((station, i) => (
                <li
                  key={i}
                  className="mb-1 cursor-pointer hover:text-blue-700"
                  onClick={() => openBookingModal(station)}
                  onMouseEnter={() => setHoverStation(station)}
                  onMouseLeave={() => setHoverStation(null)}
                >
                  {station.name} - {station.distance} km
                </li>
              ))}
            </ol>
          </div>
        )}

        {loading && <p className="mt-2">⏳ Loading stations...</p>}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && bookingLot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setBookingModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-sm w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Book Charging: {bookingLot.name}
            </h2>

            <label className="block mb-2 font-semibold">Duration (hours):</label>
            <select
              value={bookingDuration}
              onChange={(e) => setBookingDuration(Number(e.target.value))}
              className="border rounded p-2 w-full mb-4"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} hour{ i + 1 > 1 ? "s" : "" }
                </option>
              ))}
            </select>

            <p className="mb-4 font-semibold">Price: ₹{bookingDuration * 60}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EVChargingMap;
