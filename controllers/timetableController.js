/*const Timetable=require("../models/Timetable");
const multer=require("multer");
const path=require("path");

const storage=multer.diskStorage({
    destination:function(req,file,cb){
  cb(null,"uploads/")//stores ours files//
    },
    filename:function(req,file,cb){
        const uniquename=Date.now()+"-"+file.originalname;
        cb(null,uniquename);
    }
});

const upload=multer({storage:storage});

const addTimetable=async(req,res)=>{
    try{
        const{semester}=req.body;
        const image=req.file?req.file.filename:undefined;
        if(!semester || !image){
            return res.status(404).json({message:"Files are Required"});
        }
        const newTimetable=new Timetable({
            semester,image
        });
        await newTimetable.save();
        res.status(201).json({message:"Time table added Sucessfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
};

const getTimetable=async(req,res)=>{
    try{
        const timetables=await Timetable.find();
        res.status(200).json(timetables);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to Fetch Timetables"});
    }
};

module.exports={addTimetable:[upload.single("image"),addTimetable],getTimetable}.

*/

const Timetable = require("../models/Timetable");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/verifyToken"); // Path to your middleware file

// Configure Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); 
    },
    filename: function (req, file, cb) {
        const uniquename = Date.now() + "-" + file.originalname;
        cb(null, uniquename);
    }
});

const upload = multer({ storage: storage });

const addTimetable = async (req, res) => {
    try {
        const { semester } = req.body;
        const image = req.file ? req.file.filename : undefined;

        // Validation
        if (!semester || !image) {
            return res.status(400).json({ message: "Semester and Image are required" });
        }

        const newTimetable = new Timetable({
            semester,
            image,
            admin: req.adminId // Assigning the ID from verifyToken
        });

        await newTimetable.save();
        res.status(201).json({ message: "Timetable added successfully" });
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getTimetable = async (req, res) => {
    try {
        const timetables = await Timetable.find();
        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ error: "Failed to Fetch Timetables" });
    }
};

// Exporting as an array of middleware
module.exports = { 
    addTimetable: [verifyToken, upload.single("image"), addTimetable], 
    getTimetable 
};
