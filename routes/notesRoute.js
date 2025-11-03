const notesController=require("../controllers/notesContoller");
const express=require("express");

const router=express.Router();

router.post("/notes",notesController.addNotes);
router.get("/getnotes",notesController.getNotes);

module.exports=router;