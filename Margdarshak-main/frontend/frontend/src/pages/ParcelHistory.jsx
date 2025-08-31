import React, { useEffect, useState } from "react";

function ParcelHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("parcelOrders") || "[]");
    setOrders(savedOrders);
  }, []);

  if (!orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No parcel orders found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">📦 Parcel History</h1>
      <ul className="space-y-4 max-w-4xl mx-auto">
        {orders.map((order) => (
          <li key={order.id} className="bg-white rounded shadow p-4">
            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Courier:</strong> {order.courier.name}</p>
            <p><strong>Price:</strong> ₹{order.paymentAmount}</p>
            <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery}</p>
            <div className="mt-2 border-t pt-2">
              <h3 className="font-semibold">Parcel Details:</h3>
              {/* Adjust if you store more details */}
              <pre className="whitespace-pre-wrap">{JSON.stringify(order.parcelDetails, null, 2)}</pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ParcelHistory;
