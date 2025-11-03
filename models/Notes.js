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