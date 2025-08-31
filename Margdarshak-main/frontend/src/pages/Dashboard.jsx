import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // token saved at login
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return <p className="text-center mt-10 text-gray-600">Loading profile...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>
      <div className="flex flex-col items-center">
        <img
          src={user.profilePic ? `http://localhost:5000/${user.profilePic}` : "/default-avatar.png"}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border mb-4"
        />
        <p><span className="font-semibold">User ID:</span> {user.userId}</p>
        <p><span className="font-semibold">Name:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
      </div>
    </div>
  );
};

export default Dashboard;
