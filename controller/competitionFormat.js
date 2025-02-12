const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");

// @unused
exports.createCompetitionFormat = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition Format']
  #swagger.summary = 'Create Competition Format'
  #swagger.description = 'Create competition format'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Competition format data',
    schema: { 
      name: 'name',
    }
  }
  */

  const { name } = req.body;

  /*
  name: "knockout",
  mode: "single elimination",
  final: 2
  */

  res.status(200).json({
    success: true,
  });
});
