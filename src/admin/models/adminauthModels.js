import mongoose from "mongoose";

const adminAuthSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Firstname is required"]
    },
    lastname: {
        type: String,
        required: [true, "Lastname is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        default: "admin"
    }
}, { timestamps: true });

const AdminAuthModel = mongoose.model("AdminAuthModel", adminAuthSchema);

export default AdminAuthModel;