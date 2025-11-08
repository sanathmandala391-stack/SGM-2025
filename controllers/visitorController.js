const Visitor = require("../models/Visitor");

// Increment and return visitor count
const getVisitorCount = async (req, res) => {
  try {
    let visitor = await Visitor.findOne();

    if (!visitor) {
      // Create new document if none exists
      visitor = new Visitor({ count: 1 });
    } else {
      // Increment count
      visitor.count += 1;
    }

    await visitor.save();
    res.json({ count: visitor.count });
  } catch (err) {
    console.error("Visitor count error:", err);
    res.status(500).json({ count: "N/A" });
  }
};

module.exports = { getVisitorCount };

