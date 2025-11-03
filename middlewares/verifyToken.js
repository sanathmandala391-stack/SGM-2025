 const Admin=require("../models/Admin");
 const jwt=require("jsonwebtoken");
 const dotEnv=require("dotenv");

 dotEnv.config();
 const secretKey=process.env.WhatIsYourName;

 const verifyToken=async(req,res,next)=>{
    const token=req.headers.token;

    if(!token){
        return res.status(400).json({error:"Token Is Required"});
    }
    try{
const decoded=jwt.verify(token,secretKey);
const admin= await Admin.findById(decoded.adminId);

if(!admin){
return res.status(404).json({error:"Admin Not Found"});
}

req.adminId=admin._id;
next();
    }
    catch(err){
  console.log("JWT verification Error");
  return res.status(500).json({error:"Invaild Token"})
    }
 };

 module.exports=verifyToken;