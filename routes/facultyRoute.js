 const facultyController=require("../controllers/facultyController");
 const express=require("express");
 
 const router=express.Router();

 router.post("/facultyRegister",facultyController.facultyRegister);
 router.post("/facultyLogin",facultyController.facultyLogin);

 router.get("/getfaculty",facultyController.getFaculty);

 module.exports=router;