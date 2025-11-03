 const Faculty=require("../models/Faculty");
 const jwt=require("jsonwebtoken");
 const bcrypt=require("bcryptjs");
 const dotEnv=require("dotenv");
const e = require("express");

 dotEnv.config();
const secretKey=process.env.WhatIsYourName;

const facultyRegister=async(req,res)=>{
 const{name,email,password}=req.body;

 try{
  const facultyEmail=await Faculty.findOne({email});
  if(facultyEmail){
    return res.status(400).json({error:"Email Already Taken"});
  }
  const hashedPassword=await bcrypt.hash(password,10);

  const newFaculty=new Faculty({
    name,
    email,
    password:hashedPassword,
  });
  await newFaculty.save();

  const token=jwt.sign({facultyId:newFaculty._id},secretKey,{expiresIn:"24h"});
  res.status(201).json({
    message:"Faculty registration Sucessfully",
    token,
    facultyId:newFaculty._id,
    name:newFaculty.name,
    email:newFaculty.email
  });
  console.log("Registred:",newFaculty.email);
}
 catch(err){
console.log(err);
res.status(500).json({error:"Internal Server Error"});

 }
};

const facultyLogin=async(req,res)=>{
    const {email,password}=req.body;

    try{
  const faculty=await Faculty.findOne({email});
  if(!faculty || !(await bcrypt.compare(password,faculty.password))){
    return res.status(400).json({error:"Invaild email or password"});
    }
    const token=jwt.sign({facultyId:faculty._id},secretKey,{expiresIn:"24h"});
    res.status(200).json({
      success:"Login Sucessfull",
      token,
      facultyId:faculty._id,
      name:faculty.name,
      email:faculty.email,
    });
    console.log(`${email} logged in - token${token}`);
  }
    catch(err){
   console.log(err);
   res.status(500).json({error:"Internal Server Error"});
    }
};

const getFaculty=async(req,res)=>{
  try{
  const faculty=await Faculty.find();
  res.status(200).json(faculty);
  }
  catch(err){
console.log(err);
res.status(500).json({error:"Failed to fetch the faculty"});
  }
}
module.exports={facultyRegister,facultyLogin,getFaculty};

