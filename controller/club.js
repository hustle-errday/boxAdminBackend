const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

// @todo club uudiig temtseend oruulna admin aas

exports.createClub = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Create Club'
  #swagger.description = 'Create club'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Club data',
    schema: { 
      name: 'name',
      description: 'description',
      address: 'address',
      phone: 'phone',
      coach: 'coach',
      logo: 'logo',
    }
  }
  */

  const { name, description, address, phone, coach, logo } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  const checkDuplicate = await models.club.findOne({ name }).lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  const club = await models.club.create({
    name,
    description,
    address,
    phone,
    coach,
    logo,
    createdBy: token._id,
  });

  res.status(200).json({
    success: true,
    data: club,
  });
});

exports.getClubList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Get Club List'
  #swagger.description = 'Get club list'
  */

  const clubList = await models.club
    .find({}, { __v: 0 })
    .sort({ _id: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: clubList,
  });
});

exports.updateClub = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Update Club'
  #swagger.description = 'Update club'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Club data',
    schema: { 
      _id: 'club_id',
      name: 'name',
      description: 'description',
      address: 'address',
      phone: 'phone',
      coach: 'coach',
      logo: 'logo',
    }
  }
  */

  const { _id, name, description, address, phone, coach, logo } = req.body;

  const checkDuplicate = await models.club
    .findOne({ name, _id: { $ne: _id } })
    .lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  const club = await models.club.findOneAndUpdate(
    { _id: _id },
    {
      name,
      description,
      address,
      phone,
      coach,
      logo,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: club,
  });
});

exports.deleteClub = asyncHandler(async (req, res, next) => {
  // deleted schema d hadgalah

  res.status(200).json({
    success: true,
    data: "not ready",
  });
});
