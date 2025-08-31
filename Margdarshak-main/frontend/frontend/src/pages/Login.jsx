import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // Save token + userId
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setMessage("Login successful!");

      // ✅ Immediately navigate instead of waiting
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setMessage(err.response?.data?.msg || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 block mb-2 w-full rounded"
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="border p-2 block mb-2 w-full rounded"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded mt-4"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {message && <p className="mt-2 text-center text-red-500">{message}</p>}
    </div>
  );
}
