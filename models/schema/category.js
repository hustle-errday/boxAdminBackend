const mongoose = require("mongoose");
const moment = require("moment-timezone");

const categorySchema = new mongoose.Schema({
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "type",
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  sex: {
    type: String,
    enum: ["male", "female", "both"],
  },
  age: {
    type: String,
    trim: true,
  },
  weight: {
    type: String,
    trim: true,
  },
  height: {
    type: String,
    trim: true,
  },
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

module.exports = mongoose.model("category", categorySchema);
