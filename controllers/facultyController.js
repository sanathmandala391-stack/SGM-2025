 const Faculty=require("../models/Faculty");
 const jwt=require("jsonwebtoken");
 const bcrypt=require("bcryptjs");
 const dotEnv=require("dotenv");
const express= require("express");
const transporter=require("../mailer");

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

exports.facultyForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({ message: "No faculty found with that email" });
    }

    const token = jwt.sign({ id: faculty._id }, process.env.WhatIsYourName, { expiresIn: "10m" });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/faculty/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Faculty Password Reset",
      html: `
        <p>Hello ${faculty.name},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset link" });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.facultyResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.WhatIsYourName);
    const faculty = await Faculty.findById(decoded.id);

    if (!faculty) return res.status(400).json({ message: "Invalid token or user not found" });

    const hashed = await bcrypt.hash(password, 10);
    faculty.password = hashed;
    await faculty.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed or token expired" });
  }
};
module.exports={facultyRegister,facultyLogin,getFaculty};

