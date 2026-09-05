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

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

import path from "path";
import { fileURLToPath } from "url";

// needed because you're using ES Modules — __dirname isn't available by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// get the base url for the server
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "readme.html"));
});