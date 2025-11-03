const Notes=require("../models/Notes")
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

 module.exports={addNotes:[upload.single("file"),addNotes],getNotes}