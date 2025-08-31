import express from "express";
import multer from "multer";
import path from "path";
import { registerUser, loginUser, verifyOtp, getProfile, updateProfile } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/register", upload.single("profilePic"), registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("profilePic"), updateProfile);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Me Route Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
