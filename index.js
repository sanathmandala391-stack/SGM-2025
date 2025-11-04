const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const adminRoute = require("./routes/adminRoute");
const facultyRoute = require("./routes/facultyRoute");
const studentRoute = require("./routes/studentRoute");
const complaintRoute = require("./routes/complaintRoute");
const notesRoute = require("./routes/notesRoute");
const noticeRoute = require("./routes/noticeRoute");
const timetableRoute = require("./routes/timetableRoute");
const emailRoute=require("./routes/emailRoute");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(
  cors({
    origin: [
      "https://sgm-theta.vercel.app",
      "https://sgmgpt.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection failed:", err));


app.use("/api", adminRoute);
app.use("/api", facultyRoute);
app.use("/api", studentRoute);
app.use("/api", complaintRoute);
app.use("/api", notesRoute);
app.use("/api", noticeRoute);
app.use("/api", timetableRoute);
app.use("/api", emailRoute);


app.get("/", (req, res) => {
  res.send("Welcome to the SGM");
});


app.listen(PORT, () => {
  console.log(`Server started and running at port ${PORT}`);
});
