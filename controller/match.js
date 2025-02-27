const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");

exports.matching = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Match'] 
  #swagger.summary = 'Matching'
  #swagger.description = 'Matching'
  #swagger.parameters['body'] = { 
    in: 'body',
    description: 'Matching data',
    required: true,
    schema: {
      competitionId: '60f4f2c4a4c6b80015f6f5a9' 
    }
  }
  */

  const { competitionId } = req.body;

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  const participants = await models.participant
    .find({ competitionId: competitionId })
    .lean();

  res.status(200).json({
    success: true,
    data: [],
  });
});
