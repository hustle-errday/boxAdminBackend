const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");

exports.createReferee = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Create Referee'
  #swagger.description = 'Create referee account'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Referee data',
    required: true,
    schema: { 
      firstName: 'Jaagii',
      lastName: 'Jawhlan',
      phoneNo: '89808962',
      password: 'qwer123@' 
    }
  }
  */

  const { firstName, lastName, phoneNo, password } = req.body;

  const checkReferee = await models.user
    .findOne({ phoneNo: phoneNo, role: "referee" })
    .lean();
  if (checkReferee) {
    throw new myError("Бүртгэлтэй шүүгч байна.", 400);
  }

  await models.user.create({
    firstName,
    lastName,
    phoneNo,
    password,
    role: "referee",
  });

  res.status(200).json({
    success: true,
  });
});

exports.changeRefereePassword = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Change Referee Password'
  #swagger.description = 'Change referee password'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Referee data',
    required: true,
    schema: { 
      phoneNo: '89808962',
      newPassword: "qwer123@"
    }
  }
  */

  const { phoneNo, newPassword } = req.body;

  const referee = await models.user.findOne({
    phoneNo: phoneNo,
    role: "referee",
  });

  if (!referee) {
    throw new myError("Бүртгэлтэй шүүгч олдсонгүй.", 400);
  }

  referee.password = newPassword;
  await referee.save();

  res.status(200).json({
    success: true,
  });
});

exports.getRefereeList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Get Referee List'
  #swagger.description = 'Get referee list'
  #swagger.parameters['page'] = { page: 1 }
  */

  const { page } = req.query;
  const pageNumber = parseInt(page);
  const PAGE_DATA = 20;

  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const dataLength = await models.user
    .find({ role: "referee" })
    .countDocuments();

  const referees = await models.user
    .find(
      { role: "referee" },
      { firstName: 1, lastName: 1, phoneNo: 1, role: 1 }
    )
    .sort({ _id: -1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  res.status(200).json({
    success: true,
    data: referees,
    dataLength,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});

exports.putRefereeInCompetition = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Put Referee in Competition'
  #swagger.description = 'Put referee in competition'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Referee data',
    required: true,
    schema: { 
      competitionId: '60f4f2c4a4c6b80015f6f5a9',
      refereeId: ['60f4f2c4a4c6b80015f6f5a9', '60f4f2c4a4c6b80015f6f5a9']
    }
  }
  */

  const { competitionId, refereeId } = req.body;

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  const referees = await models.user.find({ _id: { $in: refereeId } });
  if (referees.length !== refereeId.length) {
    throw new myError("Зарим шүүгч олдсонгүй.", 400);
  }

  await models.competition.findByIdAndUpdate(
    { _id: competitionId },
    { $push: { referees: refereeId } }
  );

  res.status(200).json({
    success: true,
  });
});
