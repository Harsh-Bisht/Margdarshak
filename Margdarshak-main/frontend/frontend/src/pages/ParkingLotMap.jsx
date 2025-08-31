import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// --- Force map to stay below other UI ---
import "./mapStyles.css"; // We'll add CSS here

const parkingIcon = new L.DivIcon({
  html: `<div class="parking-icon">🅿️</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const addIconAnimationCSS = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .parking-icon {
      font-size: 28px;
      color: #ffb300;
      text-shadow: 0 0 5px #ffb300, 0 0 10px #ffb300;
      animation: pulseParking 1.5s infinite;
    }
    @keyframes pulseParking {
      0% { transform: scale(1); text-shadow: 0 0 5px #ffb300, 0 0 10px #ffb300; }
      50% { transform: scale(1.3); text-shadow: 0 0 15px #ffb300, 0 0 20px #ffb300; }
      100% { transform: scale(1); text-shadow: 0 0 5px #ffb300, 0 0 10px #ffb300; }
    }
  `;
  document.head.appendChild(style);
};

function Recenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

const getDistance = (lat1, lon1, lat2, lon2) =>
  (L.latLng(lat1, lon1).distanceTo([lat2, lon2]) / 1000).toFixed(2);

const ParkingLotMap = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchCoords, setSearchCoords] = useState([28.6139, 77.209]); // Default Delhi
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

  const ORS_API_KEY = "YOUR_ORS_API_KEY";

  useEffect(() => addIconAnimationCSS(), []);

  // Fetch Suggestions
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

  const fetchStations = async () => {
    if (!searchCoords) return;
    setLoading(true);
    try {
      const [lat, lon] = searchCoords;
      const query = `
        [out:json];
        (
          node["amenity"="parking"](around:5000,${lat},${lon});
          way["amenity"="parking"](around:5000,${lat},${lon});
          relation["amenity"="parking"](around:5000,${lat},${lon});
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
        const name =
          station.tags?.name || station.tags?.operator || "Nearby Parking";
        return { ...station, lat, lon, distance: parseFloat(distance), name };
      });

      stationsWithDistance.sort((a, b) => a.distance - b.distance);
      setStations(stationsWithDistance);
    } catch (err) {
      console.error("Error fetching stations:", err);
      alert("Failed to fetch parking lots");
    }
    setLoading(false);
  };

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
      lineOptions: { styles: [{ color: "orange", weight: 5 }] },
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
    const price = bookingDuration * 20;
    navigate("/parking-payment", {
      state: {
        lot: bookingLot,
        duration: bookingDuration,
        price,
      },
    });
  };

  return (
    <>
      <div className="relative z-[1000] p-4">
        <h2 className="text-xl font-bold mb-4">🅿️ Parking Lot Finder</h2>

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
            <ul className="border rounded bg-white absolute w-full z-[2000] max-h-48 overflow-auto">
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

        <div className="mb-2">
          <button
            onClick={handleCurrentLocation}
            className="px-4 py-2 bg-green-600 text-white rounded mr-2"
          >
            📍 Current Location
          </button>
          <button
            onClick={fetchStations}
            className="px-4 py-2 bg-yellow-600 text-white rounded"
          >
            🅿️ Find Parking
          </button>
        </div>
      </div>

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

        <Marker position={searchCoords}>
          <Popup>{search || "Selected Location"}</Popup>
        </Marker>

        {stations.map((station, i) => (
          <Marker
            key={i}
            position={[station.lat, station.lon]}
            icon={parkingIcon}
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
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {stations.length > 0 && (
        <div className="mt-4 p-4 border rounded bg-gray-100 max-w-md relative z-[1000]">
          <h3 className="font-semibold mb-2">Closest Parking Lots:</h3>
          <ol className="list-decimal ml-4">
            {stations.map((station, i) => (
              <li
                key={i}
                className="mb-1 cursor-pointer hover:text-yellow-700"
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

      {loading && <p className="mt-2 relative z-[1000]">⏳ Loading parking lots...</p>}

      {/* Floating Route Info */}
      {routeInfo && (
        <div className="fixed bottom-4 left-4 bg-white p-3 shadow-lg rounded-lg z-[1500]">
          🚗 Distance: {routeInfo.distance} km | ⏱ {routeInfo.duration} mins
        </div>
      )}

      {bookingModalOpen && bookingLot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
          onClick={closeBookingModal}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-sm w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Book Parking: {bookingLot.name}
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

            <p className="mb-4 font-semibold">Price: ₹{bookingDuration * 20}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeBookingModal}
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

export default ParkingLotMap;
