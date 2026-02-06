const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ error: "Token Is Required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.WhatIsYourName);
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.status(404).json({ error: "Admin Not Found" });
        }

        req.adminId = admin._id;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(401).json({ error: "Invalid or Expired Token" });
    }
};

module.exports = verifyToken;
