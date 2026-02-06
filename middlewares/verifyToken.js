const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    // Check both 'token' and standard 'authorization' header
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token Is Required" });
    }

    try {
        const secretKey = process.env.WhatIsYourName;
        if (!secretKey) {
            console.error("CRITICAL: JWT Secret Key is missing in env variables");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        const decoded = jwt.verify(token, secretKey);
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.status(404).json({ error: "Admin Not Found" });
        }

        // Convert ObjectId to String to avoid object-reference issues
        req.adminId = admin._id.toString();
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        // Distinguish between expired tokens and actual server errors
        const message = err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
        return res.status(401).json({ error: message });
    }
};

module.exports = verifyToken;
