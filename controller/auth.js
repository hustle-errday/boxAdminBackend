const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

exports.login = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Login'
  #swagger.description = 'Login with phone number and password'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Login data',
    required: true,
    schema: { 
      phoneNo: '94288008',
      password: 'password' 
    }
  }
  */

  const { phoneNo, password } = req.body;

  if (!phoneNo || !password) {
    throw new myError("Утасны дугаар эсвэл нууц үг байхгүй байна.", 400);
  }

  const admin = await models.admin.findOne({ phoneNo });
  if (!admin) {
    throw new myError("Утасны дугаар буруу байна.", 400);
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    throw new myError("Нууц үг буруу байна.", 400);
  }

  const accessToken = admin.getAccessToken();
  const refreshToken = admin.getRefreshToken();

  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
  });
});

exports.refereeLogin = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Referee Login'
  #swagger.description = 'Login with phone number and password for referee'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Login data',
    required: true,
    schema: { 
      phoneNo: '94288008',
      password: 'password' 
    }
  }
  */

  const { phoneNo, password } = req.body;

  if (!phoneNo || !password) {
    throw new myError("Нууц үг эсвэл утасны дугаар байхгүй байна.", 400);
  }

  const theUser = await models.user.findOne({
    phoneNo: phoneNo,
    role: "referee",
    isActive: true,
  });
  if (!theUser) {
    throw new myError("Бүртгэлгүй хэрэглэгч байна.", 400);
  }

  const isMatch = await theUser.matchPassword(password);
  if (!isMatch) {
    throw new myError("Нууц үг буруу байна.", 400);
  }

  const accessToken = theUser.getAccessToken();
  const refreshToken = theUser.getRefreshToken();

  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
  });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Refresh Token
  #swagger.description = 'Refresh token'
  #swagger.parameters['refreshToken'] = {
    in: 'query',
    required: true,
    schema: { refreshToken: 'refreshToken' }
  }
  */

  const { refreshToken } = req.query;

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, user) => {
    if (err) {
      throw new myError("Токен хүчингүй байна.", 401);
    }

    const theUser = await models.admin.findOne({ _id: user._id });
    if (!theUser) {
      throw new myError("Хэрэглэгч олдсонгүй.", 401);
    }

    const accessToken = theUser.getAccessToken();
    const refreshToken = theUser.getRefreshToken();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  });
});
