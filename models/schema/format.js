const mongoose = require("mongoose");
const moment = require("moment-timezone");

const formatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("format", formatSchema);
