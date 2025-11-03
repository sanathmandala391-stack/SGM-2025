 const Admin=require("../models/Admin");
 const jwt=require("jsonwebtoken");
 const bcrypt=require("bcryptjs");
 const dotEnv=require("dotenv");

 dotEnv.config();

 const secretKey=process.env.WhatIsYourName;


 const adminRegister=async(req,res)=>{
    try{
  const count=await Admin.countDocuments();
  if(count>=2){
    return res.status(400).json({message:"Admin limits Reached"});
  }
    }
    catch(err){
    console.log(err);
    return res.status(500).json({error:"internal Server Error"});
    }

    const {name,email,password}=req.body;

    try{
        const adminEmail=await Admin.findOne({email});
        if(adminEmail){
            return res.status(400).json({error:"Admin Email Alredy Taken"});
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const newAdmin=new Admin({
            name,
            email,
            password:hashedPassword,
        });
        await newAdmin.save();

        const token=jwt.sign({adminId:newAdmin._id},secretKey,{expiresIn:"24h"});
        res.status(201).json({
            message:"Admin Registration Sucessfully",
            token,
            adminId:newAdmin._id,
            name:newAdmin.name,
            email:newAdmin.email,
        })
        console.log("Registred:",newAdmin.email)
    }
    catch(err){
 console.log(err);
 return res.status(500).json({error:"Internal Server Error"});
    }
 };


 const adminLogin=async(req,res)=>{
    const{email,password}=req.body;

    try{
   const admin=await Admin.findOne({email});
   if(!admin || !(await bcrypt.compare(password,admin.password))){
    return res.status(400).json({error:"Invaild Email or Password"});
   }
   const token=jwt.sign({adminId:admin._id},secretKey,{expiresIn:"24h"});
   res.status(200).json({sucess:"Login Sucessfull",token,adminId:admin._id,name:admin.name,email:admin.email,})
    
    console.log(`${email} logged in -token ${token}`);
}
    catch(err){
   console.log(err);
   return res.status(500).json({error:"Internal Server Error"});
    }
 };

 const getAdmin=async(req,res)=>{
    try{
  const admins=await Admin.find();
  res.status(200).json(admins);
    }
    catch(err){
  console.log(err);
  res.status(500).json({error:"Faild to fetch the admins"});
    }
 }
 
 module.exports={adminRegister,adminLogin,getAdmin};
