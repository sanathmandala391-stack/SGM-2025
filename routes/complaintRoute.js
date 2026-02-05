const complaintController=require("../controllers/complaintController");
const express=require("express");

const router=express.Router();
router.post("/complaint",complaintController.addComplaint);
router.get("/getcomplaint",complaintController.getcomplaint);

module.exports=router;

