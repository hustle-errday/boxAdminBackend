const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");

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

  // @todo herwee + ees deesh angilal baiwal bolohgui, + iin daraa angilal nemwel bolohgui

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
  if (
    endDate &&
    registrationDeadline &&
    moment(endDate).isBefore(registrationDeadline)
  ) {
    throw new myError(
      "Тэмцээний дуусах болон бүртгэл хаагдах огноо зөрж байна.",
      400
    );
  }
  // check if chargeDeadline is greater than registrationDeadline using moment
  if (
    chargeDeadline &&
    registrationDeadline &&
    !moment(chargeDeadline).isBefore(registrationDeadline)
  ) {
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
  #swagger.parameters['typeId'] = { typeId: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { typeId } = req.query;

  const competitions = await models.competition
    .find({ typeId: typeId }, { __v: 0 })
    .populate("categories", "name")
    .populate("createdBy", "username")
    .sort({ _id: -1 })
    .lean();

  const ongoingCompetitions = [];
  const upcomingCompetitions = [];
  const pastCompetitions = [];
  for (let i = 0; i < competitions.length; i++) {
    competitions[i].type = competitions[i].typeId.name;
    competitions[i].categories = competitions[i].categories.map(
      (item) => item.name
    );
    delete competitions[i].typeId;

    const now = moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");

    const startDate = competitions[i].startDate
      ? moment(competitions[i].startDate)
          .tz("Asia/Ulaanbaatar")
          .format("YYYY-MM-DD HH:mm:ss")
      : null;
    // if there is no endDate then set it to 9999-12-31 23:59:59
    // means all competitions without an end date will stay in the ongoing list indefinitely
    const endDate = competitions[i].endDate
      ? moment(competitions[i].endDate)
          .tz("Asia/Ulaanbaatar")
          .format("YYYY-MM-DD HH:mm:ss")
      : "9999-12-31 23:59:59";

    if (startDate && moment(now).isBefore(moment(startDate))) {
      upcomingCompetitions.push(competitions[i]);
    } else if (moment(now).isAfter(moment(endDate))) {
      pastCompetitions.push(competitions[i]);
    } else {
      ongoingCompetitions.push(competitions[i]);
    }
  }

  const data = {
    ongoing: ongoingCompetitions,
    upcoming: upcomingCompetitions,
    past: pastCompetitions,
  };

  res.status(200).json({
    success: true,
    data: data,
  });
});

exports.getCompetition = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Get Competition by id'
  #swagger.description = 'Get competition by id'
  #swagger.parameters['_id'] = { _id: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { _id } = req.query;

  const competition = await models.competition
    .findById({ _id: _id }, { __v: 0 })
    .populate("categories", "name")
    .populate("typeId", "name")
    .populate("createdBy", "username")
    .populate("referees", "firstName lastName")
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  competition.categories = competition.categories.map((item) => ({
    _id: item._id,
    name: item.name,
  }));
  competition.createdBy = competition.createdBy.username ?? "Систем";
  competition.referees = competition.referees?.map(
    (item) => item.firstName + " " + item.lastName
  );

  res.status(200).json({
    success: true,
    data: competition,
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
  if (
    endDate &&
    registrationDeadline &&
    moment(endDate).isBefore(registrationDeadline)
  ) {
    throw new myError(
      "Тэмцээний дуусах болон бүртгэл хаагдах огноо зөрж байна.",
      400
    );
  }
  // check if chargeDeadline is greater than registrationDeadline using moment
  if (
    chargeDeadline &&
    registrationDeadline &&
    !moment(chargeDeadline).isBefore(registrationDeadline)
  ) {
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

exports.endCompetitions = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'End Competitions'
  #swagger.description = 'End competitions
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Competition data',
    schema: { 
      competitionId: 'competition_id'
    }
  }
  */

  const { competitionId } = req.body;

  const now = moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  await models.competition.findByIdAndUpdate(competitionId, {
    endDate: now,
  });

  res.status(200).json({
    success: true,
  });
});

exports.getCompetitionCategories = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Get Competition Categories'
  #swagger.description = 'Get competition categories'
  #swagger.parameters['competitionId'] = { competitionId: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { competitionId } = req.query;

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  const categories = await models.category
    .find({ _id: { $in: competition.categories } }, { __v: 0 })
    .populate("typeId", "name")
    .populate("createdBy", "username")
    .lean();
  if (categories.length !== competition.categories.length) {
    throw new myError("Зарим ангилал олдсонгүй.", 400);
  }

  categories.forEach((item) => {
    item.type = item.typeId.name;
    item.createdBy = item.createdBy.username ?? "Систем";
    delete item.typeId;
  });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

exports.makeCompetitionUnique = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Make Competition Unique'  
  #swagger.description = 'Make competition unique'
  #swagger.parameters['competitionId'] = { 
    in: 'body',
    description: 'Competition data',
    schema: {
      competitionId: '60f4f2c4a4c6b80015f6f5a9', 
      isUnique: true
    }
  }
  */

  const { competitionId, isUnique } = req.body;

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  if (isUnique === true) {
    const unique = await models.competition.findOne({ isUnique: true }).lean();
    if (unique) {
      throw new myError(
        "Зөвхөн нэг тэмцээнийг нүүр хуудсанд байршуулах боломжтой.",
        400
      );
    }

    await models.competition.updateOne(
      { _id: competitionId },
      { isUnique: true }
    );
  }
  if (isUnique === false) {
    await models.competition.updateOne(
      { _id: competitionId },
      { isUnique: false }
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.getAllReferees = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Competition']
  #swagger.summary = 'Get All Referees'
  #swagger.description = 'Get all referees'
  #swagger.parameters['competitionId'] = {
    in: 'query',
    description: 'competitionId',
    required: true
  }
  */

  const { competitionId } = req.query;

  const competition = await models.competition
    .findOne({ _id: competitionId })
    .populate("referees", "firstName lastName phoneNo role")
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  res.status(200).json({
    success: true,
    data: competition.referees,
  });
});
