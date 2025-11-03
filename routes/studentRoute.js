const studentController=require("../controllers/studentController");
const express=require("express");

const router=express.Router();

router.post("/studentRegister",studentController.studentRegister);
router.post("/studentLogin",studentController.studentLogin);

router.get("/getstudents",studentController.getStudent);

module.exports=router;