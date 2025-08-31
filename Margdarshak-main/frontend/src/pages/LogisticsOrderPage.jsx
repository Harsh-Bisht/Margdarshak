import React, { useState, useEffect } from "react";
import CourierProvidersModal from "./CourierProvidersModal";

function LogisticsOrderPage() {
  // Sender details
  const [senderName, setSenderName] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [pickupPincode, setPickupPincode] = useState("");
  const [pickupDT, setPickupDT] = useState("");

  // Receiver details
  const [receiverName, setReceiverName] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [receiverAlt, setReceiverAlt] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliverySuggestions, setDeliverySuggestions] = useState([]);
  const [deliveryPincode, setDeliveryPincode] = useState("");

  // Parcel details
  const [parcelType, setParcelType] = useState("");
  const [parcelQuantity, setParcelQuantity] = useState("");
  const [parcelWeight, setParcelWeight] = useState("");
  const [parcelDimensions, setParcelDimensions] = useState("");
  const [fragility, setFragility] = useState("");

  // Modal state
  const [showCourierModal, setShowCourierModal] = useState(false);

  // Pickup address autocomplete
  useEffect(() => {
    if (pickupAddress.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          pickupAddress
        )}&limit=5`
      );
      const data = await res.json();
      setPickupSuggestions(data);
    }, 400);
    return () => clearTimeout(timer);
  }, [pickupAddress]);

  // Delivery address autocomplete
  useEffect(() => {
    if (deliveryAddress.length < 3) {
      setDeliverySuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          deliveryAddress
        )}&limit=5`
      );
      const data = await res.json();
      setDeliverySuggestions(data);
    }, 400);
    return () => clearTimeout(timer);
  }, [deliveryAddress]);

  // Use current location button for pickup
  const useCurrentPickupLoc = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        )
          .then((res) => res.json())
          .then((data) =>
            setPickupAddress(
              data.display_name || `${pos.coords.latitude}, ${pos.coords.longitude}`
            )
          );
      },
      () => alert("Could not get your location.")
    );
  };

  // On submit, show the modal
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowCourierModal(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="min-h-screen flex flex-col items-center bg-gray-50 p-6"
      >
        <h1 className="text-2xl font-bold mb-6">📦 Place Parcel Order</h1>

        {/* Sender Details */}
        <section className="bg-white p-6 rounded shadow-md w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Sender Details</h2>
          <label className="block font-medium mb-1">Full name</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />

          <label className="block font-medium mb-1">Contact number</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={senderContact}
            onChange={(e) => setSenderContact(e.target.value)}
          />

          <label className="block font-medium mb-1">Email (optional)</label>
          <input
            type="email"
            className="border rounded p-2 w-full mb-3"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
          />

          <label className="block font-medium mb-1">Pickup address</label>
          <div className="flex space-x-2 mb-3">
            <input
              className="border rounded p-2 flex-grow"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Type address"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={useCurrentPickupLoc}
              className="bg-blue-600 text-white px-3 rounded"
            >
              📍
            </button>
          </div>
          {pickupSuggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full max-w-2xl z-50 mt-1 shadow-lg max-h-40 overflow-auto">
              {pickupSuggestions.map((place) => (
                <li
                  key={place.place_id}
                  className="p-2 cursor-pointer hover:bg-blue-100"
                  onMouseDown={() => {
                    setPickupAddress(place.display_name);
                    setPickupSuggestions([]);
                  }}
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}

          <label className="block font-medium mb-1">Pincode</label>
          <input
            className="border rounded p-2 w-full"
            value={pickupPincode}
            onChange={(e) => setPickupPincode(e.target.value)}
          />

          <label className="block font-medium mb-1 mt-3">
            Preferred pickup date and time
          </label>
          <input
            type="datetime-local"
            className="border rounded p-2 w-full"
            value={pickupDT}
            onChange={(e) => setPickupDT(e.target.value)}
          />
        </section>

        {/* Receiver Details */}
        <section className="bg-white p-6 rounded shadow-md w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Receiver Details</h2>

          <label className="block font-medium mb-1">Full name</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />

          <label className="block font-medium mb-1">Contact number</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={receiverContact}
            onChange={(e) => setReceiverContact(e.target.value)}
          />

          <label className="block font-medium mb-1">Delivery address</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Type address"
            autoComplete="off"
          />
          {deliverySuggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full max-w-2xl z-50 mt-1 shadow-lg max-h-40 overflow-auto">
              {deliverySuggestions.map((place) => (
                <li
                  key={place.place_id}
                  className="p-2 cursor-pointer hover:bg-blue-100"
                  onMouseDown={() => {
                    setDeliveryAddress(place.display_name);
                    setDeliverySuggestions([]);
                  }}
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}

          <label className="block font-medium mb-1">Pincode</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={deliveryPincode}
            onChange={(e) => setDeliveryPincode(e.target.value)}
          />

          <label className="block font-medium mb-1">Alternate contact (optional)</label>
          <input
            className="border rounded p-2 w-full"
            value={receiverAlt}
            onChange={(e) => setReceiverAlt(e.target.value)}
          />
        </section>

        {/* Parcel Details */}
        <section className="bg-white p-6 rounded shadow-md w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Parcel Details</h2>

          <label className="block font-medium mb-1">Type of item</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={parcelType}
            onChange={(e) => setParcelType(e.target.value)}
            placeholder="e.g. documents, electronics, clothes"
          />

          <label className="block font-medium mb-1">Quantity</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={parcelQuantity}
            onChange={(e) => setParcelQuantity(e.target.value)}
          />

          <label className="block font-medium mb-1">Weight (kg/g)</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={parcelWeight}
            onChange={(e) => setParcelWeight(e.target.value)}
          />

          <label className="block font-medium mb-1">Dimensions (length × width × height in cm)</label>
          <input
            className="border rounded p-2 w-full mb-3"
            value={parcelDimensions}
            onChange={(e) => setParcelDimensions(e.target.value)}
            placeholder="e.g. 20x15x10"
          />

          <label className="block font-medium mb-1">Fragility / special handling</label>
          <input
            className="border rounded p-2 w-full"
            value={fragility}
            onChange={(e) => setFragility(e.target.value)}
            placeholder="e.g. Glass, Handle with care"
          />
        </section>

        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 w-full max-w-2xl"
        >
          Check Service Provider
        </button>
      </form>

      <CourierProvidersModal
        isOpen={showCourierModal}
        onClose={() => setShowCourierModal(false)}
        parcelDetails={{
          senderName,
          senderContact,
          pickupAddress,
          pickupDT,
          receiverName,
          receiverContact,
          deliveryAddress,
          parcelType,
          parcelQuantity,
          parcelWeight,
          parcelDimensions,
          fragility,
        }}
      />
    </>
  );
}

export default LogisticsOrderPage;
