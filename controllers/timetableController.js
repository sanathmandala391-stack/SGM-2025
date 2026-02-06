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

const Timetable = require("../models/Timetable");
const multer = require("multer");
const verifyToken = require("../middlewares/verifyToken");

// Vercel fix: Use memoryStorage instead of diskStorage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const addTimetable = async (req, res) => {
    try {
        const { semester } = req.body;
        
        // When using memoryStorage, the file is in req.file.buffer
        // For now, we store the originalname or a placeholder string 
        // because Vercel won't let you write to an /uploads folder.
        const image = req.file ? req.file.originalname : undefined;

        if (!semester || !image) {
            return res.status(400).json({ message: "Semester and Image are required" });
        }

        const newTimetable = new Timetable({
            semester,
            image, 
            admin: req.adminId 
        });

        await newTimetable.save();
        res.status(201).json({ message: "Timetable added successfully" });
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
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

module.exports = { 
    addTimetable: [verifyToken, upload.single("image"), addTimetable], 
    getTimetable 
};


const Timetable = require("../models/Timetable");
const multer = require("multer");
const verifyToken = require("../middlewares/verifyToken");

// Store in memory to access req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const addTimetable = async (req, res) => {
    try {
        const { semester } = req.body;
        
        if (!req.file || !semester) {
            return res.status(400).json({ message: "Semester and Image are required" });
        }

        // Convert Buffer to Base64 String
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const newTimetable = new Timetable({
            semester,
            image: base64Image, // Save actual image data
            admin: req.adminId 
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
        const timetables = await Timetable.find().sort({ _id: -1 });
        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ error: "Failed to Fetch Timetables" });
    }
};

module.exports = { 
    addTimetable: [verifyToken, upload.single("image"), addTimetable], 
    getTimetable 
};

*/

const Timetable = require("../models/Timetable");
const multer = require("multer");
const verifyToken = require("../middlewares/verifyToken");

// Use memory storage for Vercel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addTimetable = async (req, res) => {
    try {
        const { semester } = req.body;
        
        if (!req.file || !semester) {
            return res.status(400).json({ message: "Semester and Image are required" });
        }

        // Convert file buffer to Base64 string so it's visible on Vercel
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const newTimetable = new Timetable({
            semester,
            image: base64Image, 
            admin: req.adminId 
        });

        await newTimetable.save();
        res.status(201).json({ message: "Timetable added successfully" });
    } catch (err) {
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

module.exports = { 
    addTimetable: [verifyToken, upload.single("image"), addTimetable], 
    getTimetable 
};
