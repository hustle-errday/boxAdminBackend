const mongoose = require("mongoose");
const moment = require("moment-timezone");

const sponsorSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    trim: true,
    required: true,
  },
  isCollab: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("sponsor", sponsorSchema);
