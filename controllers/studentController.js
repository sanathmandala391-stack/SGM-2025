 const Student=require("../models/Student");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const dotEnv=require("dotenv");
const nodemailer=require("nodemailer");

dotEnv.config();
const secretKey=process.env.WhatIsYourName;

const studentRegister=async(req,res)=>{
    const {name,email,pinNumber,password}=req.body;
    try{
  const studentEmail=await Student.findOne({email});
  if(studentEmail){
    return res.status(400).json({error:"Email Alreday Taken"});
  }
  const hashedPassword=await bcrypt.hash(password,10);

  const newStudent=new Student({
    name,
    email,
    pinNumber,
    password:hashedPassword,
  });

  await newStudent.save();

  const token=jwt.sign({studentId:newStudent._id},secretKey,{expiresIn:"24h"});
   res.status(201).json({
    message:"Student registration Sucessfull",token,studentId:newStudent._id,name:newStudent.name,email:newStudent.email,});

    console.log("Registred:",newStudent.email)
    }
    catch(err){
  console.log(err);
  res.status(500).json({error:"Internal Server Error"});
    }
};

const studentLogin=async(req,res)=>{
    const{email,pinNumber,password}=req.body;

    try{
  const student=await Student.findOne({email});
  if(!student ||!(await bcrypt.compare(password,student.password))){
    return res.status(400).json({error:"Invalid Email or Password"});
  }

  const token=jwt.sign({studentId:student._id},secretKey,{expiresIn:"24h"});

   res.status(200).json({
    sucess:"Login Sucessfull",
    token,
    studentId:student._id,
    name:student.name,
    email:student.email
   });
   console.log(`${email} logged in - token: ${token}`);
    }
    catch(err){
   console.log(err);
   res.status(500).json({error:"Internal Server Error"});
    }
};

const getStudent=async(req,res)=>{
  try{
  const students=await Student.find();
  res.status(200).json(students);
  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"Failed to fetch the students"});
  }
}

const forgetPassword=async(req,res)=>{
  try{
  const {email}=req.body;

  if(!email){
    return res.status(400).json({message:"Please Provide Email"});
  }
  const checkStudent=await Student.findOne({email});

  if(!checkStudent){
    return res.status(400).json({message:"Student Not Found"});
  }
  const token=jwt.sign({email},process.env.WhatIsYourName,{
    expiresIn:"1h",
  });

  const transporter=nodemailer.createTransport({
    service:"gmail",
    secure:true,
    auth:{
      EMAIL_USER:process.env.EMAIL_USER,
      EMAIL_PASS:process.env.EMAIL_PASS,

    }
  });

  const recevier={
    from:"sgmcollege@gmail.com",
    to:email,
    subject:"Password Reset Request",
    text:`Click on this link to Generate your New Password ${process.env.FRONTEND_URL}/reset-password${token}`,
  }
  await transporter.sendMail(recevier);

  return res.status(200).send({message:"Password reset link send Sucessfully on your Gamil Account",});

  }
  catch(err){
return res.status(500).send({message:"Something Went Wrong"});

  }
}

module.exports={studentRegister,studentLogin,getStudent,forgetPassword};