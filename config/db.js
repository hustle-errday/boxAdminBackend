const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.set("strictQuery", false);

  const connection = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${connection.connection.host}`);
};

module.exports = connectDB;
