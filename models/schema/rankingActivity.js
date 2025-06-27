const mongoose = require("mongoose");
const moment = require("moment-timezone");

const rankingActivitySchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "competition",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "match",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("rankingActivity", rankingActivitySchema);
