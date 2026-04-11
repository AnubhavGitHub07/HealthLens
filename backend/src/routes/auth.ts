import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

// POST /api/auth/signup
router.post("/signup", async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id as string);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating account",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id as string);

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error logging in",
    });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req: any, res: any) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // In a real app we might genericize this message to prevent email enumeration,
      // but for a hackathon we can be explicit.
      return res.status(404).json({ success: false, message: "No account found with that email" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash it and set to user model (basic security so raw token isn't in DB)
    // For simplicity in a hackathon context, we'll store it raw. 
    // In prod, you hash: crypto.createHash("sha256").update(resetToken).digest("hex")
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    console.log(`✅ Password reset requested for: ${email}`);
    console.log(`🔗 Mock Reset Link: http://localhost:5173/reset-password/${resetToken}`);

    // Return the reset link in the response for easy testing
    res.status(200).json({
      success: true,
      message: "Password reset link generated",
      resetLink: `http://localhost:5173/reset-password/${resetToken}`
    });
    
  } catch (error: any) {
    console.error("❌ Forgot Password error:", error.message);
    res.status(500).json({ success: false, message: "Error processing request" });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req: any, res: any) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired" });
    }

    // Set new password (the pre-save hook handles hashing)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset"
    });

  } catch (error: any) {
    console.error("❌ Reset Password error:", error.message);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
});

export default router;
