import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const databaseURL = process.env.databaseURL;

const connecDataBase = async () => {
    try{
        mongoose.connect(databaseURL).then(() => {
            console.log("Database connected successfully")
        }).catch((error) => {
            console.log("Database connection failed", {error});
        });
    }
    catch (error) {
        console.log("Error connecting to database", {error});
    };
};
connecDataBase();

// Import routers
import userRouters from "./src/routers/userModelRouters.js";
import postRoutes from "./src/routers/postModelRouters.js";

// Import admin auth router
import adminAuthRoutes from "./src/admin/routers/adminauthRouters.js";
// Import user management router for admin
import userManagementAdminRoutes from "./src/admin/routers/usermanagmentAdminRouters.js";

// Use the user router
app.use("/v1/api/users", userRouters);
// Use the post router
app.use("/v1/api/posts", postRoutes);

// Use the admin auth router

app.use("/v1/api/admin/auth", adminAuthRoutes);

// Use the user management router for admin
app.use("/v1/api/admin/manage", userManagementAdminRoutes);

// get the base url for the server
app.get("/", (req, res) => {
    res.status(200).json({success: true, message: "Welcome to the Blog API 2.0 Project here is the base url, and you can access the API endpoints from here, also you can get all blog endpoints by reading the README.md file." });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});