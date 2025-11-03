const mongoose=require("mongoose");

const complaintSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    pinNumber:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    }
});

const Complaint=mongoose.model("Complaint",complaintSchema);

module.exports=Complaint;