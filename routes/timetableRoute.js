const timetableController=require("../controllers/timetableController");
const express=require("express");

const router=express.Router();

router.post("/timetable",timetableController.addTimetable);
router.get("/gettimetable",timetableController.getTimetable);

module.exports=router;