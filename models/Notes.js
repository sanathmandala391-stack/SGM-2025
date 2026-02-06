const mongoose=require("mongoose");

const notesSchema=new mongoose.Schema({
    subject:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    semester:{
        type:String,
        required:true
    },
    file:{
        type:String
    }
})

const Notes=mongoose.model("Notes",notesSchema);
module.exports=Notes;
/*

const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    branch: { type: String },
    semester: { type: String, required: true },
    file: { type: String, required: true }, // Stores the filename
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notes", notesSchema);*/
