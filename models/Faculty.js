 const mongoose=require("mongoose");

 const FacultySchema=new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
   password:{
    type:String,
    required:true,
   },
     otp: {                 
    type: String
  },
  otpExpiry: {          
    type: Date
  }
 })

 const Faculty=mongoose.model('Faculty',FacultySchema);

 module.exports=Faculty;