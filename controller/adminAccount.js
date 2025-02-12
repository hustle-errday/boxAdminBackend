const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

exports.createAdmin = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Admin']
  #swagger.summary = 'Create Admin'
  #swagger.description = 'Create admin account'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Admin data',
    required: true,
    schema: { 
      username: 'anujin',
      phoneNo: '94288008',
      password: 'password' 
    }
  }
  */

  const { username, phoneNo, password } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  if (!token) {
    throw new myError("Токен олдсонгүй.", 400);
  }

  const checkAdmin = await models.admin.findOne({ phoneNo }).lean();
  if (checkAdmin) {
    throw new myError("Бүртгэлтэй админ байна.", 400);
  }

  const admin = await models.admin.create({
    username,
    phoneNo,
    password,
    createdBy: token._id,
  });

  res.status(200).json({
    success: true,
    data: {
      username: admin.username,
      phoneNo: admin.phoneNo,
    },
  });
});

exports.getAdminList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Admin']
  #swagger.summary = 'Get Admin List'
  #swagger.description = 'Get admin list'
  */

  const adminList = await models.admin
    .find({}, { password: 0, __v: 0 })
    .populate("createdBy", "username")
    .lean();

  adminList.forEach((admin) => {
    admin.createdBy = admin.createdBy?.username ?? "Систем";
  });

  res.status(200).json({
    success: true,
    data: adminList,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Admin']
  #swagger.summary = 'Update Admin'
  #swagger.description = 'Update admin account'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Admin data',
    required: true,
    schema: { 
      _id: '60f7c7b4c1a1a6e8c8a1f9c5',
      phoneNo: '94288008',
      password: 'password' 
    }
  }
  */

  const { _id, phoneNo, password } = req.body;

  const theAdmin = await models.admin.findOne({ _id: _id, phoneNo: phoneNo });
  if (!theAdmin) {
    throw new myError("Админ олдсонгүй.", 400);
  }

  theAdmin.password = password;
  await theAdmin.save();

  res.status(200).json({
    success: true,
  });
});
