/*const Notes=require("../models/Notes")
 const multer=require("multer");
 const path=require("path");

 const storage= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        const uniqueName=Date.now()+"-"+file.originalname;
        cb(null,uniqueName)
    }
 });

 const upload=multer({storage:storage});

 const addNotes=async(req,res)=>{
    try{
        const{subject,branch,semester}=req.body;
      const file=req.file ? req.file.filename:undefined;
    
    if(!subject ||!file||!semester){
        return res.status(401).json({message:"That Fields Are Required"});
    }
    const newNotes=new Notes({
       subject,
       branch,
       semester,
       file 
    })
    await newNotes.save();
    res.status(201).json({message:"Notes Uploaded Sucessfully"});
    }
    catch(err){
   console.log(err);
   res.status(500).json({error:"Internal Server Error"});
    }
 }

 const getNotes=async(req,res)=>{
    try{
const notes=await Notes.find();
res.status(200).json(notes);
    }
    catch(err){
console.log(err);
res.status(500).json({error:"Failed to fetch the Notes"});
    }
 }

 // At the bottom of notesController.js
module.exports = {
    addNotes, 
    getNotes,
    upload // Export the multer instance directly
};

*/

const Notes = require("../models/Notes");
const multer = require("multer");

/**
 * IMPORTANT:
 * memoryStorage works on Vercel
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
});

const addNotes = async (req, res) => {
  try {
    const { subject, branch, semester } = req.body;

    if (!req.file || !subject || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const base64File = req.file.buffer.toString("base64");

    const note = new Notes({
      subject,
      branch,
      semester,
      fileData: base64File,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
    });

    await note.save();

    res.status(201).json({ message: "Notes uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Notes.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

module.exports = {
  addNotes,
  getNotes,
  upload,
};
