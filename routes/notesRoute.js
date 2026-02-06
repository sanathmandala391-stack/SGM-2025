/*const notesController=require("../controllers/notesContoller");
const express=require("express");

const router=express.Router();

router.post("/notes",notesController.addNotes);
router.get("/getnotes",notesController.getNotes);

module.exports=router;
*/


const notesController = require("../controllers/notesContoller");
const express = require("express");
const router = express.Router();

// Put the middleware [upload.single("file")] here directly
router.post("/notes", notesController.upload.single("file"), notesController.addNotes);
router.get("/getnotes", notesController.getNotes);

module.exports = router;
