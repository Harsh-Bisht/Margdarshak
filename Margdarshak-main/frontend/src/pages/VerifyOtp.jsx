import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [searchParams]);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );
      setMessage(res.data.message);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setTimeout(() => {
        window.location.href = "/Home";
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl mb-4">Verify Your Account</h2>
      <input
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2 w-full"
        disabled
      />
      <input
        name="otp"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <button
        onClick={handleVerify}
        className="bg-blue-500 text-white p-2 w-full"
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify OTP"}
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}
