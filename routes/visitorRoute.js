
const express = require("express");
const router = express.Router();
const { getVisitorCount } = require("../controllers/visitorController");

router.get("/visitor-count", getVisitorCount);

module.exports = router;
