const Faculty = require("../models/Faculty"); // Use Faculty, not Admin
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ error: "Token Is Required" });
    }

    try {
        // Use the secret key from your .env
        const decoded = jwt.verify(token, process.env.WhatIsYourName);
        
        // Match the key from your Login Controller: 'facultyId'
        const faculty = await Faculty.findById(decoded.facultyId); 

        if (!faculty) {
            return res.status(404).json({ error: "Faculty not found" });
        }

        // Attach the ID to the request so the controller can use it
        req.adminId = faculty._id; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid Token" });
    }
};

module.exports = verifyToken;
