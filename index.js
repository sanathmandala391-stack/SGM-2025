const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Require routes
const adminRoute = require("./routes/adminRoute");
const facultyRoute = require("./routes/facultyRoute");
const studentRoute = require("./routes/studentRoute");
const complaintRoute = require("./routes/complaintRoute");
const notesRoute = require("./routes/notesRoute");
const noticeRoute = require("./routes/noticeRoute");
const timetableRoute = require("./routes/timetableRoute");
const visitorRoute = require("./routes/visitorRoute");

const app = express();
const PORT = process.env.PORT || 7000;

// ✅ CORS Configuration (Fixes the Access-Control-Allow-Origin error)
app.use(
  cors({
    origin: [
      "https://sgm-theta.vercel.app",
      "https://sgmgpt.netlify.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
// Serve static files (like notes and resources)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection failed:", err));

// Route Middleware
app.use("/api", adminRoute);
app.use("/api", facultyRoute);
app.use("/api", studentRoute);
app.use("/api", complaintRoute);
app.use("/api", notesRoute);
app.use("/api", noticeRoute);
app.use("/api", timetableRoute);
app.use("/api", visitorRoute);

// Base Route
app.get("/", (req, res) => {
  res.send("Welcome to SGM");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});