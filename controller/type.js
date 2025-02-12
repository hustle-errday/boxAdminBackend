const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

exports.createType = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Type']
  #swagger.summary = 'Create Type'
  #swagger.description = 'Create type'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Type data',
    schema: { 
      name: 'name',
      description: 'description',
    }
  }
  */

  const { name, description } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  const checkDuplicate = await models.type.findOne({ name }).lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  const type = await models.type.create({
    name,
    description,
    createdBy: token._id,
  });

  res.status(200).json({
    success: true,
    data: type,
  });
});

exports.getTypeList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Type']
  #swagger.summary = 'Get Type List'
  #swagger.description = 'Get type list'
  */

  const typeList = await models.type
    .find({}, { __v: 0 })
    .sort({ _id: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: typeList,
  });
});

exports.updateType = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Type']
  #swagger.summary = 'Update Type'
  #swagger.description = 'Update type'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Type data',
    schema: { 
      _id: '_id',
      name: 'name',
      description: 'description',
    }
  }
  */

  const { _id, name, description } = req.body;

  const type = await models.type.findById(_id);
  if (!type) {
    throw new myError("Төрөл олдсонгүй.", 400);
  }

  const checkDuplicate = await models.type
    .findOne({ name, _id: { $ne: _id } })
    .lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  type.name = name;
  type.description = description;

  await type.save();

  res.status(200).json({
    success: true,
    data: type,
  });
});

exports.deleteType = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: "not ready",
  });
});
