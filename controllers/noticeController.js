const Notice=require("../models/Notice");
const path=require("path");

const addNotice=async(req,res)=>{
    try{
  const {title,message}=req.body||{};
  if(!title||!message){
    return res.status(400).json({error:"Title and messages are required"});
  }
  const newNotice=new Notice({
    title,message
  });
  await newNotice.save();
  res.status(200).json({message:"Notices are Added Sucessfully"});
    }
    catch(err){
  console.log(err);
  res.status(500).json({error:"Internal Server Error"});
    }

};

const getNotice=async(req,res)=>{
    try{
        const notices=await Notice.find();
        res.status(200).json(notices);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to fetch the notices"});
    }
}

module.exports={addNotice,getNotice};