"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaApple, FaGithub, FaMicrosoft } from "react-icons/fa";
import axios from "axios";

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction === "login" ? -50 : 50,
    }),
    visible: { opacity: 1, x: 0 },
    exit: (direction) => ({
      opacity: 0,
      x: direction === "login" ? 50 : -50,
    }),
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (tab === "login") {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        setSuccess("Login successful ✅");
        console.log(res.data); // store token if needed
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            name: form.name,
            email: form.email,
            password: form.password,
          }
        );
        setSuccess("Account created 🎉 Please login now");
        console.log(res.data);
        setTab("login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-950 via-black to-green-900">
      {/* Background */}
      <img
        src="/traffic-bg.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
      />

      {/* Heading */}
      <h1 className="text-9xl font-extrabold text-white mb-6 z-10 relative">
        Welcome
      </h1>
      <p className="text-white/70 text-xl mb-10 z-10 relative text-center max-w-xl">
        Experience the future of digital innovation
      </p>

      {/* Get Started */}
      <button
        onClick={() => setShowAuth(true)}
        className="px-10 py-4 bg-green-800 hover:bg-green-900 text-white rounded-lg text-lg z-10 relative transition transform hover:scale-105"
      >
        Get Started
      </button>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-96 p-8 rounded-2xl backdrop-blur-xl bg-black/80 shadow-xl border border-white/20 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Join Us</h2>
              <p className="text-center text-white/60 mb-6">
                Sign in to your account or create a new one
              </p>

              {/* Social logins (placeholders) */}
              <div className="flex justify-center gap-4 mb-6 text-xl">
                <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <FaGoogle />
                </button>
                <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <FaApple />
                </button>
                <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <FaMicrosoft />
                </button>
                <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <FaGithub />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-3 text-gray-400 text-sm">
                  OR CONTINUE WITH EMAIL
                </span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              {/* Tabs */}
              <div className="flex justify-between mb-6">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 py-2 rounded-l-lg ${
                    tab === "login"
                      ? "bg-green-800"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setTab("signup")}
                  className={`flex-1 py-2 rounded-r-lg ${
                    tab === "signup"
                      ? "bg-green-800"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Forms */}
              <div className="relative min-h-[250px]">
                <AnimatePresence mode="wait" custom={tab}>
                  {tab === "login" ? (
                    <motion.form
                      key="login"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom="login"
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col space-y-4 absolute w-full"
                    >
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none"
                      />
                      <input
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none"
                      />
                      <button
                        disabled={loading}
                        className="p-3 rounded-lg bg-green-800 hover:bg-green-900 transition"
                      >
                        {loading ? "Signing In..." : "Sign In"}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom="signup"
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col space-y-4 absolute w-full"
                    >
                      <input
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none"
                      />
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none"
                      />
                      <input
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none"
                      />
                      <button
                        disabled={loading}
                        className="p-3 rounded-lg bg-green-800 hover:bg-green-900 transition"
                      >
                        {loading ? "Creating..." : "Create Account"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Status messages */}
              {error && (
                <p className="text-red-400 text-center mt-4">{error}</p>
              )}
              {success && (
                <p className="text-green-400 text-center mt-4">{success}</p>
              )}

              <button
                onClick={() => setShowAuth(false)}
                className="mt-6 w-full py-2 text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
