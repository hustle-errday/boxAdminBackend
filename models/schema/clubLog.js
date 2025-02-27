const mongoose = require("mongoose");
const moment = require("moment-timezone");

const clubLogSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.ObjectId,
    ref: "club",
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
  joinAs: {
    // coach, athlete
    type: String,
    required: true,
    trim: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: String,
    trim: true,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("clubLog", clubLogSchema);
