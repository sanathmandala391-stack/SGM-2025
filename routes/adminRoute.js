const adminController=require("../controllers/adminController");
const express=require("express");
const verifyToken=require("../middlewares/verifyToken")

const router=express.Router();

router.post('/adminRegister',verifyToken,adminController.adminRegister);
router.post("/adminLogin",adminController.adminLogin);

router.get("/getadmin",adminController.getAdmin);

module.exports=router;