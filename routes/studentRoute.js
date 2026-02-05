const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// ✅ Manual Registration & Login (Email + Password)
router.post("/studentRegister", studentController.studentRegister);
router.post("/studentLogin", studentController.studentLogin);

// ✅ Firebase Phone OTP Login (no email needed)
router.post("/verify-phone", studentController.verifyFirebaseLogin);

// ✅ Password Reset (optional for manual login users)
router.post("/reset-password/student", studentController.resetPassword);

module.exports = router;
