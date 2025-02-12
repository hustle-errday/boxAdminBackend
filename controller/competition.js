const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

// @todo neg toglolt yawagdah hugatsaa awaad automataar guideg baij boloh l yum

exports.createCompetition = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Create Competition'
  #swagger.description = 'Create competition'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Competition data',
    schema: { 
      typeId: 'type _id',
      name: 'name',
      categories: ['_id', '_id'],
      startDate: 'YYYY-MM-DD HH:mm:ss',
      endDate: 'YYYY-MM-DD HH:mm:ss',
      description: 'description',
      registrationStartDate: 'YYYY-MM-DD HH:mm:ss',
      registrationDeadline: 'YYYY-MM-DD HH:mm:ss',
      charge: 80000,
      chargeDeadline: 'YYYY-MM-DD HH:mm:ss',
      address: 'address',
      banner: 'banner',
      organizer: 'zohion baiguulj baigaa gazar',
    }
  }
  */

  const {
    typeId,
    name,
    categories,
    startDate,
    endDate,
    description,
    registrationStartDate,
    registrationDeadline,
    charge,
    chargeDeadline,
    address,
    banner,
    organizer,
  } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  //@todo add shuugch

  const [checkType, checkDuplicate, checkCategory] = await Promise.all([
    models.type.findById(typeId).lean(),
    models.competition.findOne({ name }).lean(),
    models.category.find({ _id: { $in: categories } }).lean(),
  ]);

  if (!checkType) {
    throw new myError("Төрөл олдсонгүй.", 400);
  }
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }
  if (checkCategory.length !== categories.length) {
    throw new myError("Зарим ангилал олдсонгүй.", 400);
  }

  // check if endDate is greater than registrationDeadline using moment
  if (moment(endDate).isBefore(registrationDeadline)) {
    throw new myError(
      "Тэмцээний дуусах болон бүртгэл хаагдах огноо зөрж байна.",
      400
    );
  }
  // check if chargeDeadline is greater than registrationDeadline using moment
  if (moment(chargeDeadline).isBefore(registrationDeadline)) {
    throw new myError(
      "Хураамж төлөх хугацаа бүртгэл хаагдах огнооноос өмнө байх ёстой.",
      400
    );
  }

  const creation = await models.competition.create({
    typeId,
    name,
    categories,
    startDate,
    endDate,
    description,
    registrationStartDate,
    registrationDeadline,
    charge: parseInt(charge),
    chargeDeadline,
    address,
    banner,
    organizer,
    createdBy: token._id,
  });

  res.status(200).json({
    success: true,
    data: creation,
  });
});

exports.getCompetitionList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Get Competition List'
  #swagger.description = 'Get competition list'
  */

  const competitionList = await models.competition
    .find({}, { __v: 0 })
    .populate("categories", "name")
    .populate("createdBy", "username")
    .sort({ _id: -1 })
    .lean();

  console.log(competitionList);

  res.status(200).json({
    success: true,
    data: competitionList,
  });
});

exports.updateCompetition = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Update Competition'
  #swagger.description = 'Update competition'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Competition data',
    schema: { 
      _id: 'competition_id',
      name: 'name',
      categories: ['_id', '_id'],
      startDate: 'YYYY-MM-DD HH:mm:ss',
      endDate: 'YYYY-MM-DD HH:mm:ss',
      description: 'description',
      registrationStartDate: 'YYYY-MM-DD HH:mm:ss',
      registrationDeadline: 'YYYY-MM-DD HH:mm:ss',
      charge: 80000,
      chargeDeadline: 'YYYY-MM-DD HH:mm:ss',
      address: 'address',
      banner: 'banner',
      organizer: 'zohion baiguulj baigaa gazar',
    }
  }
  */

  const {
    _id,
    name,
    categories,
    startDate,
    endDate,
    description,
    registrationStartDate,
    registrationDeadline,
    charge,
    chargeDeadline,
    address,
    banner,
    organizer,
  } = req.body;

  const theCompetition = await models.competition.findById(_id).lean();
  if (!theCompetition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  const checkDuplicate = await models.competition
    .findOne({ name, _id: { $ne: _id } })
    .lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  // check if category exists
  const checkCategory = await models.category
    .find({ _id: { $in: categories } })
    .lean();
  if (checkCategory.length !== categories.length) {
    throw new myError("Зарим ангилал олдсонгүй.", 400);
  }

  // check if endDate is greater than registrationDeadline using moment
  if (moment(endDate).isBefore(registrationDeadline)) {
    throw new myError(
      "Тэмцээний дуусах болон бүртгэл хаагдах огноо зөрж байна.",
      400
    );
  }
  // check if chargeDeadline is greater than registrationDeadline using moment
  if (moment(chargeDeadline).isBefore(registrationDeadline)) {
    throw new myError(
      "Хураамж төлөх хугацаа бүртгэл хаагдах огнооноос өмнө байх ёстой.",
      400
    );
  }

  const update = await models.competition.findByIdAndUpdate(
    _id,
    {
      name,
      categories,
      startDate,
      endDate,
      description,
      registrationStartDate,
      registrationDeadline,
      charge: parseInt(charge),
      chargeDeadline,
      address,
      banner,
      organizer,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: update,
  });
});

exports.deleteCompetition = asyncHandler(async (req, res, next) => {
  // temtseen ehlehees umnu ustgaj bolno
  // deleted schema d hadgalah

  res.status(200).json({
    success: true,
    data: "not ready",
  });
});
