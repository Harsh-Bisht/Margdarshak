import React from "react";
import { useNavigate } from "react-router-dom";

function Logistics() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">📦 Logistics Dashboard</h1>
      <button
        onClick={() => navigate("/logistics-order")}
        className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition"
      >
        📦 Place Orders
      </button>
      <button
        onClick={() => navigate("/parcel-history")}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
      >
        📜 Parcel History / Orders
      </button>
    </div>
  );
}

export default Logistics;
