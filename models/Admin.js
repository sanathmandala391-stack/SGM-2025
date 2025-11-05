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
      resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  }

 })

 const Admin=mongoose.model('Admin',AdminSchema);
 module.exports=Admin;