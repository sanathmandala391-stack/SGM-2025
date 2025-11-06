 const facultyController=require("../controllers/facultyController");
 const express=require("express");
 
 const router=express.Router();

 router.post("/facultyRegister",facultyController.facultyRegister);
 router.post("/facultyLogin",facultyController.facultyLogin);

 router.post("/forgot-password/faculty", facultyController.facultyForgotPassword);
router.post("/reset-password/faculty/:token", facultyController.facultyResetPassword);

 router.get("/getfaculty",facultyController.getFaculty);

 module.exports=router;