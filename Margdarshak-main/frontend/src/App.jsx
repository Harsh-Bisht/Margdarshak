import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Profile from "./pages/Profile.jsx";
import Transportation from "./pages/Transportation.jsx";
import QuickVehicleSupport from "./pages/QuickVehicleSupport";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import LogisticsOrderPage from "./pages/LogisticsOrderPage";
import BookCab from "./pages/BookCab";
import VerifyOtp from "./pages/VerifyOtp";
import EVCharging from "./pages/EVCharging";
import Logistics from "./pages/Logistics";
import RouteMap from "./pages/RouteMap";
import ParkingLotMap from "./pages/ParkingLotMap";
import ConfirmBooking from "./pages/ChargingPayment.jsx";
import ParkingPayment from "./pages/ParkingPayment";
import LogisticsPayment from "./pages/LogisticsPayment";
import ParcelHistory from "./pages/ParcelHistory";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPic, setUserPic] = useState(null);
  const navigate = useNavigate();

  // 🔑 Central auth sync
  const syncAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUserPic(data.profilePic))
        .catch((err) => console.error(err));
    } else {
      setUserPic(null);
    }
  };

  useEffect(() => {
    syncAuth(); // run on mount
    window.addEventListener("storage", syncAuth); // listen for login/logout

    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
    window.dispatchEvent(new Event("storage")); // notify other components
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="w-full p-4 bg-blue-600 text-white flex justify-between">
        <h1 className="font-bold">My Website</h1>
        <div className="flex items-center">
          {!isLoggedIn ? (
            <>
              <Link to="/register" className="mr-4 hover:underline">
                Register
              </Link>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile">
                <img
                  src={
                    userPic
                      ? `http://localhost:5000/uploads/${userPic}`
                      : "/default-user.png"
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </Link>
              <button onClick={handleLogout} className="ml-4 hover:underline">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Routes */}
      <div className="p-6 w-full max-w-4xl mx-auto">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/quick-vehicle-support"
            element={<QuickVehicleSupport />}
          />
          <Route path="/parking-payment" element={<ParkingPayment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book-cab" element={<BookCab />} />
          <Route path="/ev-charging" element={<EVCharging />} />
          <Route path="/logistics-order" element={<LogisticsOrderPage />} />
          <Route path="/parking-lot" element={<ParkingLotMap />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/route-map" element={<RouteMap />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/parcel-history" element={<ParcelHistory />} />
          <Route path="/confirm-booking" element={<ConfirmBooking />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logistics-payment" element={<LogisticsPayment />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transportation"
            element={
              <ProtectedRoute>
                <Transportation />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
