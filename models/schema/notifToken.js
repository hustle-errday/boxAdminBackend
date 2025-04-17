const mongoose = require("mongoose");

const notifTokenSchema = new mongoose.Schema({
  notifKey: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("notifToken", notifTokenSchema);
