const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const { matchCategory } = require("../myFunctions/competitionHelper");

exports.getParticipantList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Participant']
  #swagger.summary = 'Get Participant List'
  #swagger.description = 'Get participant list'
  #swagger.parameters['competitionId'] = { competitionId: '60f4f2c4a4c6b80015f6f5a9' }
  #swagger.parameters['searchBy'] = { searchBy: 'name' }
  */

  const { competitionId } = req.query;

  const participants = await models.participant
    .find(
      { competitionId: competitionId },
      { __v: 0, competitionId: 0, createdAt: 0 }
    )
    .populate("categoryId", "name")
    .sort({ _id: -1 })
    .lean();

  for (let i = 0; i < participants.length; i++) {
    const userInfo = await models.user
      .findById(
        { _id: participants[i].userId },
        {
          __v: 0,
          password: 0,
          role: 0,
          registrationNumber: 0,
          isActive: 0,
          createdAt: 0,
        }
      )
      .lean();
    if (!userInfo) {
      throw new myError("Тамирчин олдсонгүй.", 400);
    }

    participants[i].userInfo = userInfo;
  }

  if (participants.length === 0) {
    throw new myError("Тэмцээнд бүртгүүлсэн тамирчид байхгүй байна.", 400);
  }

  res.status(200).json({
    success: true,
    data: participants,
  });
});

exports.getParticipant = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Participant']
  #swagger.summary = 'Get Participant'
  #swagger.description = 'Get participant'
  #swagger.parameters['_id'] = { _id: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { _id } = req.query;

  const participant = await models.participant
    .findById({ _id: _id }, { __v: 0, competitionId: 0, createdAt: 0 })
    .populate("categoryId", "name")
    .lean();
  if (!participant) {
    throw new myError("Тамирчин олдсонгүй.", 400);
  }

  const userInfo = await models.user
    .findById(
      { _id: participant.userId },
      {
        __v: 0,
        password: 0,
        role: 0,
        registrationNumber: 0,
        isActive: 0,
        createdAt: 0,
      }
    )
    .lean();
  if (!userInfo) {
    throw new myError("Тамирчин олдсонгүй.", 400);
  }

  participant.userInfo = userInfo;

  res.status(200).json({
    success: true,
    data: participant,
  });
});

exports.payCharge = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Participant']
  #swagger.summary = 'Pay charge for participant'
  #swagger.description = 'Pay charge for participant'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Participant data',
    schema: { 
      _id: 'participant_id',
      chargePaid: 'true',
    }
  }
  */

  const { _id, chargePaid } = req.body;

  const participant = await models.participant.findOne({ _id: _id });
  if (!participant) {
    throw new myError("Тамирчин олдсонгүй.", 400);
  }

  participant.chargePaid = chargePaid;
  participant.paidAt = moment()
    .tz("Asia/Ulaanbaatar")
    .format("YYYY-MM-DD HH:mm:ss");
  await participant.save();

  res.status(200).json({
    success: true,
  });
});

exports.validateParticipant = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Participant']
  #swagger.summary = 'Validate Participant'
  #swagger.description = 'Validate participant'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Participant data',
    schema: { 
      _id: 'participant_id',
      isFixed: true,
      data: {
        height: 180,
        weight: 80,
        birthDate: "2023-02-25",
        sex: "male"
      }
    }
  }
  */

  const { _id, isFixed, data } = req.body;

  const participant = await models.participant.findOne({ _id }).lean();
  if (!participant) {
    throw new myError("Тамирчин олдсонгүй.", 400);
  }

  const competition = await models.competition
    .findOne({
      _id: participant.competitionId,
    })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  if (!isFixed) {
    await models.participant.updateOne(
      { _id: _id },
      { $set: { status: "approved" } }
    );

    res.status(200).json({
      success: true,
    });
  }
  if (isFixed) {
    const categories = await models.category.find({
      _id: { $in: competition.categories },
    });

    const userData = {
      userSex: data.sex,
      userAge: moment().diff(moment(data.birthDate, "YYYY-MM-DD"), "years"),
      userWeight: data.weight,
      userHeight: data.height,
    };

    const matchedCategory = await matchCategory(categories, userData);

    if (!matchedCategory) {
      throw new myError("Тамирчинд таарах ангилал олдсонгүй.", 400);
    }

    await models.participant.updateOne(
      { _id: _id },
      { $set: { status: "approved", categoryId: matchedCategory._id } }
    );

    res.status(200).json({
      success: true,
      data: matchedCategory,
    });
  }
});
