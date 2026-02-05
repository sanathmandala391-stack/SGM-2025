/*const express = require("express");
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
});*/



const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// 1. Load environment variables
dotenv.config();

// 2. Import routes
const adminRoute = require("./routes/adminRoute");
const facultyRoute = require("./routes/facultyRoute");
const studentRoute = require("./routes/studentRoute");
const complaintRoute = require("./routes/complaintRoute");
const notesRoute = require("./routes/notesRoute");
const noticeRoute = require("./routes/noticeRoute");
const timetableRoute = require("./routes/timetableRoute");
const visitorRoute = require("./routes/visitorRoute");

const app = express();

// 3. CORS Configuration
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

// Static files (Note: Vercel might not persist these; consider Cloudinary/S3 later)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. MongoDB Connection (Serverless optimized)
// We connect without waiting so the function responds faster
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection failed:", err));

// 5. Route Middleware
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
  res.send("Welcome to SGM API - Running on Vercel");
});

// 6. EXPORT FOR VERCEL
// This is what prevents the Build Exit Code 1
module.exports = app;

// 7. Local development support
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 7000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on port ${PORT}`);
  });
}