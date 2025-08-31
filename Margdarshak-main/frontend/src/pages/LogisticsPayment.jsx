import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function LogisticsPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  const courier = location.state?.courier;
  const parcelDetails = location.state?.parcelDetails; // Pass this from LogisticsOrderPage if needed

  if (!courier || !parcelDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order data missing. Please place an order first.</p>
      </div>
    );
  }

  const handleConfirmPayment = () => {
    // Assemble full order record
    const orderRecord = {
      id: Date.now(),
      courier,
      parcelDetails,
      paymentAmount: courier.price,
      orderDate: new Date().toISOString(),
      estimatedDelivery: courier.estimatedTime,
    };

    // Save to localStorage (or send to backend)
    const existingOrders = JSON.parse(localStorage.getItem("parcelOrders") || "[]");
    existingOrders.push(orderRecord);
    localStorage.setItem("parcelOrders", JSON.stringify(existingOrders));

    alert("Payment successful! Your order has been saved.");
    navigate("/parcel-history");
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Confirm Your Logistics Order</h1>
      <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
        <p><strong>Courier:</strong> {courier.name}</p>
        <p><strong>Price:</strong> ₹{courier.price}</p>
        <p><strong>Estimated Delivery Time:</strong> {courier.estimatedTime}</p>
        {/* Show parcel details summary here if desired */}

        <button
          className="mt-6 w-full px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleConfirmPayment}
        >
          Confirm and Pay
        </button>

        <button
          className="mt-4 w-full px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default LogisticsPayment;
