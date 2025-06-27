const mongoose = require("mongoose");
const moment = require("moment-timezone");

const rankingSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  updatedScore: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    trim: true,
  },
  place: {
    type: Number,
    trim: true,
  },
  move: {
    type: String,
    enum: ["up", "down", "same"],
    default: "same",
  },
  moveBy: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("ranking", rankingSchema);
