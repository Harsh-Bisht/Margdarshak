Register.jsx;
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setProfilePic(e.target.files[0]);

  const handleRegister = async () => {
    try {
      if (!form.name || !form.email || !form.password) {
        setMessage("Name, email and password are required.");
        return;
      }

      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("password", form.password);

      if (profilePic) {
        data.append("profilePic", profilePic);
      }

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      navigate(`/verify-otp?email=${form.email}`);
    } catch (err) {
      console.error(err.response?.data);
      setMessage(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Registration failed. Try again."
      );
    }
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="border p-2 block mb-2 w-full rounded"
      />

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

      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 block mb-2 w-full rounded"
        accept="image/*"
      />

      {profilePic && (
        <img
          src={URL.createObjectURL(profilePic)}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-full mt-2 mx-auto"
        />
      )}

      <button
        onClick={handleRegister}
        className="bg-green-600 hover:bg-green-700 text-white p-2 w-full rounded mt-4"
      >
        Register
      </button>

      {message && <p className="mt-2 text-red-500 text-center">{message}</p>}
    </div>
  );
}
