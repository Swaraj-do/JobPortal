import { User } from "../models/user.model.js";
import bcrypt from "bcrypt.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullname, email, phonenumber, password, role } = req.body;
    if (!fullname || !email || !phonenumber || !password || !role) {
      return res.status(400).json({
        message: "something is missing",
        successs: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "user already exists",
        successs: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phonenumber,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "account has been created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "something is missing",
        successs: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "user does not exist",
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "incorrect password",
        success: false,
      });
    }

    // Check if the role matches
    if (user.role !== role) {
      return res.status(400).json({
        message: "incorrect role",
        success: false,
      });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1824 * 60 * 60 * 1000,
        httpOnly: true,
        samesite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        success: true,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          phonenumber: user.phonenumber,
          role: user.role,
          profile: user.profile,
        },
      });
  } catch (error) {
    console.log(error);
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token").json({ 
      message: "logged out successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      success: false,
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullname, phonenumber, profile } = req.body;
    const userId = req.userId; // Assuming you have middleware to set req.userId  
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullname, phonenumber, profile },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "profile updated successfully",
      success: true,
      user: {
        id: updatedUser._id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        phonenumber: updatedUser.phonenumber,
        role: updatedUser.role,
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error", 
      success: false,
    });
  }
};