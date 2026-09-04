import express from "express";
import {registerUser, loginUser, getUserProfile, logoutUser, updateUserProfile, deleteUserProfile} from "../controllers/userManagmentController.js";
import authMiddleware from "../middlewares/authmiddlewares.js";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.post("/logout", authMiddleware, logoutUser);
userRouter.patch("/update-profile", authMiddleware, updateUserProfile);
userRouter.delete("/delete-profile", authMiddleware, deleteUserProfile);
export default userRouter;
