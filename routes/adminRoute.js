const adminController = require("../controllers/adminController");
const express = require("express");
const verifyToken = require("../middlewares/verifyToken")

const router = express.Router();

// ---------------- AUTH ROUTES ----------------

// 1. Registration Route (Used to initially create admin accounts)
router.post('/adminRegister', adminController.adminRegister);

// 2. Login Route
router.post("/adminLogin", adminController.adminLogin);

// 3. Forgot Password / Send OTP Route
router.post("/forgot-password/admin", adminController.adminForgotPassword);

// 4. MISSING: Verify OTP Route
// This is a crucial step between sending the OTP and resetting the password.
router.post("/verify-otp/admin", adminController.verifyAdminOtp); 

// 5. Reset Password Route (Corrected function name)
// The function name was 'resetAdminPassword' in the controller, not 'adminResetPassword'.
router.post("/reset-password/admin", adminController.resetAdminPassword); 

// ---------------- OTHER ROUTES ----------------

// Example of a GET route (Requires the getAdmin function in your controller)
// Note: This route uses the verifyToken middleware for protection.
//router.get("/getadmin", verifyToken, adminController.getAdmin);

module.exports = router;