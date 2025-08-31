import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token"); // check login

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Platform</h1>

      {!isLoggedIn ? (
        <p className="text-gray-600">Please login to access more features.</p>
      ) : (
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/transportation")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            🚚 Transportation
          </button>
          <button
            onClick={() => navigate("/logistics")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition"
          >
            📦 Logistics
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
