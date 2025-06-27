const mongoose = require("mongoose");
const moment = require("moment-timezone");

const invoiceSchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "competition",
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "participant",
  },
  total: {
    type: Number,
    required: true,
  },
  invoice_id: {
    type: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: String,
    trim: true,
    default: "",
  },
  // ebarimtGenerated: {
  //   type: Boolean,
  //   default: false,
  // },
  // ebarimtLines: {
  //   type: Array,
  // },
  qpay: {
    type: Object,
  },
  // ebarimt: {
  //   type: Object,
  // },
  createdAt: {
    type: String,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

module.exports = mongoose.model("invoice", invoiceSchema);
