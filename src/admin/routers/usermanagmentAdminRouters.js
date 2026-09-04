import express from "express";
import authMiddleware from "../../middlewares/authmiddlewares.js";
import {requireAdmin} from "../middlewares/adminauthMiddleWares.js";
import { getAllUsers, getUserById, deleteUserAndPostsById, getUserPosts } from "../controller/usermanagementController.js";

const userMangementByAdminRouter = express.Router();

// Apply admin login authentication and admin role authorization middlewares to all routes in this router

userMangementByAdminRouter.use(authMiddleware);
userMangementByAdminRouter.use(requireAdmin);

// Define routes for user management by admin

userMangementByAdminRouter.get("/users", getAllUsers);
userMangementByAdminRouter.get("/users/:id", getUserById);
userMangementByAdminRouter.delete("/users/:id", deleteUserAndPostsById);
userMangementByAdminRouter.get("/users/posts/:id", getUserPosts);

export default userMangementByAdminRouter;