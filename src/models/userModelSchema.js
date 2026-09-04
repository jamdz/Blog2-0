import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, "Name is required" ]
    },
    lastname: {
        type: String,
        required: [ true, "Lastname is required" ]
    },
    username: {
        type: String,
        required: [ true, "Username is required" ],
        unique: true
    },
    email: {
        type: String,
        required: [ true, "Email is required" ],
        unique: true
    },
    password: {
        type: String,
        required: [ true, "Password is required"]
    },
    phoneNumber: {
        type: Number,
        required: [ true, "Phone number is required" ],
        unique: true
    },
    region: {
        type: String,
        required: [ true, "Region is required" ]
    },
    role: {
        type: String,
        default: "user"
    }

}, { timestamps: true });

const UserModel = mongoose.model("UserModel", userSchema);

export default UserModel;