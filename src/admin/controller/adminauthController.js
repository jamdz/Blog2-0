import UserModel from "../../models/userModelSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// @desc Register a new admin
// @route POST /api/admin/register
// @access Private (should itself be protected — see note below)
export const registerAdmin = async (req, res) => {
    try {
        const {  name, lastname, email, username, password, phoneNumber, region } = req.body;

        const existingAdmin = await UserModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new UserModel({
            name,
            lastname,
            email,
            username,
            phoneNumber,
            region,
            password: hashedPassword,
            role: "admin"
        });
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(201).json({ success: true, message: "Admin registered successfully", token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Login an admin
// @route POST /api/admin/login
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await UserModel.findOne({ username, role: "admin" });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 2 * 60 * 60 * 1000
        });

        res.status(200).json({ success: true, message: "Admin logged in successfully", token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Get admin profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await UserModel.findOne({ _id: req.user.id, role: "admin" }).select("-password");
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        res.status(200).json({ success: true, admin });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Logout an admin
export const logoutAdmin = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Admin logged out successfully" });
};