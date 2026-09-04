import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModelSchema.js";

// Create user registration controller
export const registerUser = async (req, res) => {
    try {
        const { name, lastname, username, email, password, phoneNumber, region, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered, please use a different email." });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            name,
            lastname,
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            region,
            role
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({ message: "User have been registered successfully", token });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create user login controller
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        // Set Cookie Properties to be used in the response
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            // secure: process.env.NODE_ENV === "production", // Set to true in production
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create User get profile controller
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming you have a middleware that sets req.user
        const user = await User.findById(userId).select("-password"); // Exclude password from the response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create User logout controller
export const logoutUser = (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error logging out user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create User update profile controller
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming you have a middleware that sets req.user
        const { name, lastname, username, email, phoneNumber, region } = req.body;
        const user = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile updated successfully", user });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create User delete profile controller
export const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming you have a middleware that sets req.user
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
