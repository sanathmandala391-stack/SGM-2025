const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pinNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, 
  otp: String,
  otpExpire: Date,
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
