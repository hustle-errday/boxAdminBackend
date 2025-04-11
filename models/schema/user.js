const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const userSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  registrationNumber: {
    type: String,
    trim: true,
  },
  sex: {
    type: String,
    enum: ["male", "female"],
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "club",
  },
  role: {
    type: String,
    default: "athlete",
    enum: ["athlete", "coach", "referee"],
  },
  height: {
    type: Number,
    trim: true,
  },
  weight: {
    type: Number,
    trim: true,
  },
  birthDate: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: String,
    trim: true,
    default: function () {
      return moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");
    },
  },
});

userSchema.index({ phoneNo: 1 }, { unique: true });
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hashSync(this.password, salt);
  }
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      phoneNo: this.phoneNo,
      username: this.phoneNo,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};
userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      phoneNo: this.phoneNo,
      username: this.phoneNo,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_EXPIRE,
    }
  );
};

module.exports = mongoose.model("user", userSchema);
