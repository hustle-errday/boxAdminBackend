const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");
const { uploadImage } = require("../API's/s3Functions");

exports.uploadImage = asyncHandler(async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return new myError("Зургаа оруулна уу.", 400);
  }

  const uploaded = await uploadImage(file);
  if (uploaded.success === false) {
    return new myError("Зураг оруулахад алдаа гарлаа.", 400);
  }

  res.status(200).json({
    success: true,
    data: uploaded.imageUrl,
  });
});
