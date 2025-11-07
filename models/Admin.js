 const mongoose=require("mongoose");

 const AdminSchema=new mongoose.Schema({
 
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
     phone: {
        type: String,
        required: true, // <-- make sure it's required
        unique: true,
     },
  otp: String,
  otpExpire: Date,
 })

 const Admin=mongoose.model('Admin',AdminSchema);
 module.exports=Admin;