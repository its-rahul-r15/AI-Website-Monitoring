const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/helpers");

// -----------------------------
// USER REGISTER
// -----------------------------
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation check
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          telegramChatId: user.telegramChatId,
          notificationPreferences: user.notificationPreferences,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// -----------------------------
// USER LOGIN
// -----------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Get user from database
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("User found, comparing password...");

    // Password compare
    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
      console.log("Password incorrect for:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log("Login successful for:", email);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          telegramChatId: user.telegramChatId,
          notificationPreferences: user.notificationPreferences,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    
    if (error.message.includes('Illegal arguments')) {
      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// -----------------------------
// GET PROFILE
// -----------------------------
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          telegramChatId: user.telegramChatId,
          notificationPreferences: user.notificationPreferences,
        },
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// -----------------------------
// UPDATE PROFILE
// -----------------------------
const updateProfile = async (req, res) => {
  try {
    const { name, telegramChatId, notificationPreferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          telegramChatId: user.telegramChatId,
          notificationPreferences: user.notificationPreferences,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};