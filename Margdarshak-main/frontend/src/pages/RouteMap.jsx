import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
// import RouteInfoBox from "./RouteInfoBox"; // Optional if you want to use it

function RouteMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, destination } = location.state || {};

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeDistance, setRouteDistance] = useState(null); // <--- here inside component
  const [routeDuration, setRouteDuration] = useState(null); // <--- here inside component

  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjEzY2UxN2RlMTdhMzQ4NDg5Njk5ZjY2M2VkZDFkMDE4IiwiaCI6Im11cm11cjY0In0=";

  const getCoords = async (address) => {
    if (!address) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  };

  const fetchRoute = async (start, end) => {
    if (!start || !end) return;
    setRouteLoading(true);
    const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_API_KEY,
        },
        body: JSON.stringify({
          coordinates: [
            [start[1], start[0]], // lon, lat
            [end[1], end[0]],
          ],
        }),
      });
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(coords);

        // Set distance and duration
        const summary = data.features[0].properties.summary;
        setRouteDistance(summary.distance);
        setRouteDuration(summary.duration);
      }
    } catch (err) {
      console.error("Failed to fetch route", err);
      setRouteCoords([]);
      setRouteDistance(null);
      setRouteDuration(null);
    } finally {
      setRouteLoading(false);
    }
  };

  // Fetch pickup coordinates
  useEffect(() => {
    if (!pickup) setPickupCoords(null);
    else getCoords(pickup).then(setPickupCoords);
  }, [pickup]);

  // Fetch destination coordinates
  useEffect(() => {
    if (!destination) setDestinationCoords(null);
    else getCoords(destination).then(setDestinationCoords);
  }, [destination]);

  // Fetch route after coords ready
  useEffect(() => {
    if (pickupCoords && destinationCoords) fetchRoute(pickupCoords, destinationCoords);
    else {
      setRouteCoords([]);
      setRouteDistance(null);
      setRouteDuration(null);
    }
  }, [pickupCoords, destinationCoords]);

  if (!pickupCoords || !destinationCoords)
    return (
      <div className="text-center mt-10">
        <p>Loading coordinates...</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Go Back
        </button>
      </div>
    );

  const center = pickupCoords;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Your Route</h1>
      <MapContainer center={center} zoom={13} style={{ height: 500, width: "100%", maxWidth: 800 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Marker position={pickupCoords}>
          <Popup>Pickup Location</Popup>
        </Marker>
        <Marker position={destinationCoords}>
          <Popup>Destination</Popup>
        </Marker>
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" weight={5} />}
      </MapContainer>
      {routeLoading && <p className="mt-4 font-semibold">Loading route...</p>}

      {(routeDistance || routeDuration) && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px 15px",
            borderRadius: 8,
            fontWeight: "bold",
            zIndex: 10000,
            fontSize: 14,
            minWidth: 140,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {routeDistance && <div>Distance: {(routeDistance / 1000).toFixed(2)} km</div>}
          {routeDuration && (
            <div>
              Duration:{" "}
              {Math.floor(routeDuration / 3600) > 0 ? `${Math.floor(routeDuration / 3600)}h ` : ""}
              {Math.floor((routeDuration % 3600) / 60)}m
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RouteMap;
