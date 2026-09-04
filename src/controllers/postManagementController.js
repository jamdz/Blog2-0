import PostModel from "../models/postModelSchema.js";

// Create a new post

export const createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const imagePath = req.file ? req.file.path : null;
        
        if (!req.user || !req.user.userId) {
                    return res.status(401).json({ success: false, message: "Unauthorized: User information is missing" });
        }
        if (!title || !content || !category) {
            return res.status(400).json({ success: false, message: "Title, content, and category are required" });
        }
      
        if (!imagePath) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const newPost = new PostModel({
            title,
            content,
            category,
            image: imagePath,
            author: req.user.userId
        });

        await newPost.save();
        res.status(201).json({ success: true, message: "Your post has been created successfully", data: newPost });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all authenticated user's own posts
export const getAllPosts = async (req, res) => {
    try { 
        const posts = await PostModel.find({ author: req.user.userId });
          if (!req.user || !req.user.userId) {
                    return res.status(401).json({ success: false, message: "Unauthorized: User information is missing" });
        }
        if (!posts || posts.length === 0) {
            return res.status(404).json({ postcounts: posts.length, success: false, message: "No posts found for this user" });
        }
        res.status(200).json({ postcounts: posts.length, success: true, data: posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a user's post by ID
export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, category } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User information is missing" });
        }

        const updatedPost = await PostModel.findOneAndUpdate(
            { _id: postId, author: req.user.userId },
            { title, content, category, image: imagePath },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: "Post not found or you are not the owner" });
        }

        res.status(200).json({ success: true, data: updatedPost });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// delete a user's post by ID
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const deletedPost = await PostModel.findOneAndDelete({ _id: postId, author: req.user.userId });

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User information is missing" });
        }

        if (!deletedPost) {
            return res.status(404).json({ success: false, message: "Post not found, post already deleted or you are not the owner" });
        } 
     res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Search posts by title or content

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchPosts = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        const safeQuery = escapeRegex(query);

        const posts = await PostModel.find({
            $or: [
                { title: { $regex: safeQuery, $options: "i" } },
                { content: { $regex: safeQuery, $options: "i" } }
            ]
        });

        if (!posts || posts.length === 0) {
            return res.status(404).json({ postcount: posts.length, success: false, message: "No posts title or content found matching the search query" });
        }

        res.status(200).json({ success: true, postcount: posts.length, message: `Posts title or content matching the search query for ** ${query} ** successfully found`, data: posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Filter posts by category
export const filterPostsByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        if (!category || category.trim() === "") {
            return res.status(400).json({ success: false, message: "Catergory Entry is empty must be filled or Category is required for filtering" });
        }
        const posts = await PostModel.find({ category });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ postcount: posts.length, success: false, message: "No posts found for this category" });
        }
        res.status(200).json({ postcount: posts.length, success: true, message: `Posts Filtering under the category for: ** ${category} ** were successfully found`, data: posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    };
};
