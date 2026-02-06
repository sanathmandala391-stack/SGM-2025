/*const mongoose=require("mongoose");

const notesSchema=new mongoose.Schema({
    subject:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    semester:{
        type:String,
        required:true
    },
    file:{
        type:String
    }
})

const Notes=mongoose.model("Notes",notesSchema);
module.exports=Notes;
*/
const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    branch: { type: String },
    semester: { type: String, required: true },

    fileData: { type: String, required: true }, // Base64
    fileType: { type: String, required: true }, // application/pdf etc
    fileName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notes", notesSchema);
