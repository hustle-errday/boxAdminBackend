const mongoose = require("mongoose");
const moment = require("moment-timezone");

const participantSchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "competition",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  chargePaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: String,
    trim: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },

  // it will be result of competition like 1st place, 2nd place, etc
  // result: {
  //   type: String,
  //   trim: true,
  // },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("participant", participantSchema);
