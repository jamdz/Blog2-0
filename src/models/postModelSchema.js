import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    },
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    image: {
        type: String,
        required: false
    }
}, { timestamps: true });

// enables text search on title + content
postSchema.index({ title: "text", content: "text" });

const PostModel = mongoose.model("PostModel", postSchema);

export default PostModel;