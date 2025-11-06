 const Student=require("../models/Student");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const dotEnv=require("dotenv");
const transporter = require("../mailer");

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

// ---------------- FORGOT PASSWORD ----------------
const studentForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: "No student found with that email" });
    }

    const token = jwt.sign({ id: student._id }, process.env.WhatIsYourName, {
      expiresIn: "10m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/student/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Student Password Reset",
      html: `
        <p>Hello ${student.name},</p>
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
const studentResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.WhatIsYourName);
    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(400).json({ message: "Invalid token or user not found" });
    }

    const hashed = await bcrypt.hash(password, 10);
    student.password = hashed;
    await student.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed or token expired" });
  }
};


module.exports={studentRegister,studentLogin,getStudent,studentForgotPassword,studentResetPassword};