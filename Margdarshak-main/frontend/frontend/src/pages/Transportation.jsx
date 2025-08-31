import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

function Transportation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🚦 Transportation Services</h1>
      <div className="grid gap-4 w-full max-w-md">
        <Link
          to="/book-cab"
          className="block p-4 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 text-center"
        >
          🚖 Book a Cab
        </Link>
        <button
          className="p-4 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600"
          onClick={() => navigate("/ev-charging")}
        >
          ⚡ EV Charging
        </button>
        <button className="p-4 bg-yellow-500 text-white font-semibold rounded-xl shadow-md hover:bg-yellow-600" onClick={() => navigate("/parking-lot")}>
          🅿️ Parking Lot
        </button>
        <button className="p-4 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-600" onClick={() => navigate("/quick-vehicle-support")}>
          🛠️ Quick Vehicle Support
        </button>
      </div>
    </div>
  );
}
export default Transportation;

