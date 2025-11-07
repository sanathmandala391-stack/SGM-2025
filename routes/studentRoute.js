const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// ✅ Student Registration & Login
router.post("/studentRegister", studentController.studentRegister);
router.post("/studentLogin", studentController.studentLogin);

// ✅ Forgot Password (send OTP)
router.post("/forgot-password/student", studentController.studentForgotPassword);

// ✅ Verify OTP
router.post("/verify-otp/student", studentController.verifyOtp);

// ✅ Reset Password (after OTP verification)
router.post("/reset-password/student",studentController.resetPassword);

// ✅ Get All Students
//router.get("/getstudents",studentController.);

module.exports = router;
