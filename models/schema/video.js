const mongoose = require("mongoose");
const moment = require("moment-timezone");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: String,
    trim: true,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("video", videoSchema);
