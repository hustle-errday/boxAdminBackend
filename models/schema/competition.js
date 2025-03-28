const mongoose = require("mongoose");
const moment = require("moment-timezone");

const competitionSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  startDate: {
    type: String,
    trim: true,
  },
  endDate: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  registrationStartDate: {
    type: String,
    trim: true,
  },
  registrationDeadline: {
    type: String,
    trim: true,
  },
  charge: {
    type: Number,
    trim: true,
  },
  chargeDeadline: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  banner: {
    type: String,
    trim: true,
  },
  organizer: {
    type: String,
    trim: true,
  },
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "type",
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
  ],
  referees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
  },
  createdAt: {
    type: String,
    trim: true,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("competition", competitionSchema);
