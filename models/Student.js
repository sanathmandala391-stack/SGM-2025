const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  pinNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {                 
    type: String
  },
  otpExpiry: {          
    type: Date
  }
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
