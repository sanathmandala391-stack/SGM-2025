const facultyController = require("../controllers/facultyController");
const express = require("express");

const router = express.Router();

// ---------------- AUTH ROUTES ----------------

// 1. Registration Route
router.post("/facultyRegister", facultyController.facultyRegister);

// 2. Login Route
router.post("/facultyLogin", facultyController.facultyLogin);

// 3. Forgot Password / Send OTP Route
router.post("/forgot-password/faculty", facultyController.facultyForgotPassword);

// 4. Verify OTP Route (Required before reset)
// The controller function was named 'verifyFacultyOtp' in the previous answer.
router.post("/verify-otp/faculty", facultyController.verifyFacultyOtp); 

// 5. Reset Password Route
// The controller function was named 'resetFacultyPassword' in the previous answer.
router.post("/reset-password/faculty", facultyController.resetFacultyPassword); 

// // Example of a GET route (currently commented out in your original code)
// router.get("/getfaculty",facultyController.getFaculty); 

module.exports = router;