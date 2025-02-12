const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
  },
  phoneNo: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "moderator"],
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

adminSchema.index({ phoneNo: 1 }, { unique: true });
adminSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hashSync(this.password, salt);
  }
});
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
adminSchema.methods.getAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      phoneNo: this.phoneNo,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};
adminSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      phoneNo: this.phoneNo,
      username: this.username,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_EXPIRE,
    }
  );
};

module.exports = mongoose.model("admin", adminSchema);
