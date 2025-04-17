const mongoose = require("mongoose");
const moment = require("moment-timezone");

const notifHistorySchema = new mongoose.Schema({
  message: {
    type: Object,
    required: true,
  },
  notifType: {
    type: String,
    required: true,
    enum: ["public", "private", "custom"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "competition",
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("notifHistory", notifHistorySchema);
