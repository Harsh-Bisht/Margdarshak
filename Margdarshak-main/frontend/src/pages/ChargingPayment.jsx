import { useLocation, useNavigate } from "react-router-dom";

function ChargingPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lot, duration, price } = location.state || {};

  if (!lot || !duration || !price) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No booking data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Confirm Your EV Charging Booking</h1>
      <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
        <p><strong>Location:</strong> {lot.name}</p>
        <p><strong>Duration:</strong> {duration} hour{duration > 1 ? "s" : ""}</p>
        <p><strong>Total Price:</strong> ₹{price}</p>

        <button
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded"
          onClick={() => alert("Payment successful! (demo)")}
        >
          Confirm and Pay
        </button>

        <button
          className="mt-4 px-6 py-2 bg-gray-300 rounded"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ChargingPayment;
