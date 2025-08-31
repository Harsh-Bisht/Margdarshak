// RouteInfoBox.jsx
export default function RouteInfoBox({ distance, duration }) {
  if (!distance && !duration) return null;

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
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
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {distance && <div>Distance: {(distance / 1000).toFixed(2)} km</div>}
      {duration && <div>Duration: {formatDuration(duration)}</div>}
    </div>
  );
}
