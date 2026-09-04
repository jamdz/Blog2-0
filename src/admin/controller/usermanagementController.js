import mongoose from "mongoose";
import UserModel from "../../models/userModelSchema.js";
import PostModel from "../../models/postModelSchema.js";

// @desc Get all users
// @route GET /api/admin/users
// @access Private (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({ role: "user" }).select("-password");
        if (!users || users.length === 0) {
            return res.status(404).json({ usercounts: 0, success: false, message: "User Data Entries Not Found" });
        }
        res.status(200).json({ usercounts: users.length, message: "All users date entries from database retrieved successfully", success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get a single user by ID
// @route GET /api/admin/users/:id
// @access Private (admin only)
export const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ usercounts: 0, success: false, message: "User Data Entries Not Found" });
        }
        res.status(200).json({ usercounts: 1, message: "User retrieved successfully", success: true, user });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc get all posts by a user
// @route GET /api/admin/users/posts/:id
// @access Private (admin only)
export const getUserPosts = async (req, res) => {
    try {
           const posts = await PostModel.find({ author: req.params.id });
         // const user = await UserModel.findById(req.params.id).select("-password");
        if (!posts || posts.length === 0) {
            return res.status(404).json({ usercounts: 0, success: false, message: "Posts for the specified user not found" });
        }
        // Assumes `posts` is embedded on UserModel. If posts live in a separate
        // PostModel collection instead, swap this for:
       
        // const posts = user.posts || [];
        res.status(200).json({ usercounts: posts.length, message: "User posts retrieved successfully", success: true, posts });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};



// @desc delete a user and their posts by ID
// @route DELETE /api/admin/users/:id
// @access Private (admin only)
export const deleteUserAndPostsById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ usercounts: 0, success: false, message: "User By Such ID Not Found, Try Another ID." });
        }

        await PostModel.deleteMany({ author: req.params.id }).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ usercounts: 1, message: "User deletion operation completed successfully.", success: true });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};