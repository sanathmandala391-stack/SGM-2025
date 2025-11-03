const mongoose=require("mongoose");

const noticeSchema=new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  message:{
    type:String,
    required:true
  }

})

const Notice=mongoose.model("Notice",noticeSchema);

module.exports=Notice;