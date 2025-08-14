const mongoose = require("mongoose");
const moment = require("moment-timezone");

const informationSchema = new mongoose.Schema({
  image: {
    type: String,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("information", informationSchema);
