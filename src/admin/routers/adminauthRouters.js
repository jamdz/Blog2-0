import express from "express";
import authMiddleware from "../../middlewares/authmiddlewares.js";
import {requireAdmin} from "../middlewares/adminauthMiddleWares.js";
import { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile } from "../controller/adminauthController.js";

const adminAuthRouter = express.Router();

// Admin auth routes
adminAuthRouter.get("/profile", authMiddleware, requireAdmin, getAdminProfile);
adminAuthRouter.post("/register", registerAdmin);
adminAuthRouter.post("/login", loginAdmin);
adminAuthRouter.post("/logout", authMiddleware, requireAdmin, logoutAdmin);


export default adminAuthRouter;