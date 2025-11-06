 const Admin=require("../models/Admin");
 const jwt=require("jsonwebtoken");
 const bcrypt=require("bcryptjs");
 const dotEnv=require("dotenv");
 const transporter = require("../mailer");

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
 
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "No admin found with that email" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.WhatIsYourName, {
      expiresIn: "10m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/admin/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Admin Password Reset",
      html: `
        <p>Hello ${admin.name},</p>
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

const adminResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.WhatIsYourName);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(400).json({ message: "Invalid token or user not found" });
    }

    const hashed = await bcrypt.hash(password, 10);
    admin.password = hashed;
    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed or token expired" });
  }
};


 module.exports={adminRegister,adminLogin,getAdmin,adminForgotPassword,adminResetPassword};
