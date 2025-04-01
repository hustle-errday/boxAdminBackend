const mongoose = require("mongoose");
const moment = require("moment-timezone");

const matchSchema = new mongoose.Schema({
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
  playerOne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "participant",
  },
  playerTwo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "participant",
  },
  score: {
    type: Object,
    trim: true,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "participant",
  },
  round: {
    type: Number,
    required: true,
  },
  matchNumber: {
    type: Number,
    required: true,
  },
  refereeCount: {
    type: Number,
    default: 0,
  },
  matchDateTime: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("match", matchSchema);
