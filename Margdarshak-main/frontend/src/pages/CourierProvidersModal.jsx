import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const courierData = [
  { id: "dhl", name: "DHL", price: 250, estimatedTime: "2-3 days" },
  { id: "bluedart", name: "BlueDart", price: 200, estimatedTime: "3-4 days" },
  { id: "delhivery", name: "Delhivery", price: 180, estimatedTime: "4-5 days" },
  { id: "fedex", name: "FedEx", price: 300, estimatedTime: "2 days" },
];

function CourierProvidersModal({ isOpen, onClose, parcelDetails }) {
  const navigate = useNavigate();
  const [selectedCourier, setSelectedCourier] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedCourier) {
      alert("Please select a courier partner.");
      return;
    }
    navigate("/logistics-payment", {
      state: {
        courier: selectedCourier,
        parcelDetails,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Select Courier Partner</h2>
        <ul className="divide-y divide-gray-200 mb-6 max-h-64 overflow-auto">
          {courierData.map(({ id, name, price, estimatedTime }) => (
            <li
              key={id}
              className={`py-3 flex justify-between items-center cursor-pointer ${
                selectedCourier?.id === id ? "bg-blue-100" : ""
              }`}
              onClick={() => setSelectedCourier({ id, name, price, estimatedTime })}
            >
              <div>
                <span className="font-semibold">{name}</span>
                <div className="text-sm text-gray-600">
                  ₹{price} &bull; {estimatedTime}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 text-white py-2 rounded mb-3 hover:bg-green-700"
        >
          Confirm Order
        </button>
        <button
          onClick={onClose}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CourierProvidersModal;
