import express from "express";
import multer from "multer";;
import {createPost, getAllPosts, updatePost, deletePost, searchPosts, filterPostsByCategory} from "../controllers/postManagementController.js";
import authMiddleware from "../middlewares/authmiddlewares.js";

const postRouter = express.Router();
const upload = multer({ dest: "uploads/" });


postRouter.post("/create-post", authMiddleware, upload.single("image"), createPost);
postRouter.get("/my-posts", authMiddleware, getAllPosts);
postRouter.patch("/update-post/:postId", authMiddleware, upload.single("image"), updatePost);
postRouter.delete("/delete-post/:postId", authMiddleware, deletePost);
postRouter.get("/search-posts", searchPosts);
postRouter.get("/filter-posts", filterPostsByCategory);
export default postRouter;