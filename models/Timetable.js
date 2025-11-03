 const mongoose=require("mongoose");


 const timetableSchema=new mongoose.Schema({
  semester:{
    type:String,
    required:true
  },
  image:{
    type:String
  }
 })

 const Timetable=mongoose.model("Timetable",timetableSchema);
 

 module.exports=Timetable;