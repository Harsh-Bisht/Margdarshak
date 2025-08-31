import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Send OTP email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP if needed
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Verification Code",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  });
};

// 📌 Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      profilePic: req.file ? req.file.filename : null,
    });

    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      msg: "User registered. Please verify your email with OTP.",
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ msg: "User already verified" });
    }

    if (user.otp !== Number(otp) || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ msg: "Account verified successfully! You can now login." });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // ✅ Check if verified
    if (!user.isVerified) {
      return res.status(403).json({ msg: "Please verify your account first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpires"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ GetProfile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Update Profile
export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.profilePic = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password -otp -otpExpires");

    res.json(user);
  } catch (err) {
    console.error("❌ UpdateProfile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
