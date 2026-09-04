import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        // Get the token from the request headers
        const userToken = req.cookies.token;
        console.log("Token from cookies:", userToken);

        if (!userToken) {
            return res.status(403).json({ message: "Unauthorized: You must be logged in to access this resource..." });
        }

        // Verify the token
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        req.user = decoded; // Attach user information to the request object
        next(); // Call the next middleware function
    }
    catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default authMiddleware;