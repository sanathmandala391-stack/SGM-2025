const adminController=require("../controllers/adminController");
const express=require("express");
const verifyToken=require("../middlewares/verifyToken")

const router=express.Router();

router.post('/adminRegister',adminController.adminRegister);
router.post("/adminLogin",adminController.adminLogin);

router.post("/forgot-password/admin", adminController.adminForgotPassword);
router.post("/reset-password/admin/:token", adminController.adminResetPassword);


router.get("/getadmin",adminController.getAdmin);

module.exports=router;