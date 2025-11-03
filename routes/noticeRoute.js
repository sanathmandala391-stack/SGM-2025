const noticeController=require("../controllers/noticeController");
const express=require("express");

const router=express.Router();

router.post("/notice",noticeController.addNotice);
router.get("/getnotice",noticeController.getNotice);

module.exports=router;