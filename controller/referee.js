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

exports.searchReferee = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Search Referee'
  #swagger.description = 'Search referee'
  #swagger.parameters['search'] = { search: 'Jaagii' }
  */

  const { search } = req.query;

  const referees = await models.user.find(
    {
      role: "referee",
      $or: [
        { firstName: { $regex: search, $options: "si" } },
        { lastName: { $regex: search, $options: "si" } },
        { phoneNo: { $regex: search, $options: "si" } },
      ],
    },
    { firstName: 1, lastName: 1, phoneNo: 1, role: 1 }
  );

  res.status(200).json({
    success: true,
    data: referees,
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
  if (competition.referees?.includes(refereeId)) {
    throw new myError("Шүүгч аль хэдийн тэмцээнд бүртгэгдсэн байна.", 400);
  }

  await models.competition.findByIdAndUpdate(
    { _id: competitionId },
    { $push: { referees: refereeId } }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getCompetitionsForReferee = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Get Competitions for Referee'
  #swagger.description = 'Get competitions for referee'
  */

  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  const competitions = await models.competition
    .find(
      { referees: { $in: [token._id] } },
      {
        _id: 1,
        name: 1,
        banner: 1,
        startDate: 1,
        endDate: 1,
        registrationStartDate: 1,
        registrationDeadline: 1,
      }
    )
    .populate("categories", "name")
    .sort({ _id: -1 })
    .lean();

  // group competition by date
  const ongoingCompetitions = [];
  const upcomingCompetitions = [];
  const pastCompetitions = [];
  for (let i = 0; i < competitions.length; i++) {
    competitions[i].categories = competitions[i].categories.map((item) => [
      { name: item.name, _id: item._id },
    ]);

    const now = moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");

    const startDate = moment(competitions[i].startDate)
      .tz("Asia/Ulaanbaatar")
      .format("YYYY-MM-DD HH:mm:ss");
    // if there is no endDate then set it to 9999-12-31 23:59:59
    // means all competitions without an end date will stay in the ongoing list indefinitely
    const endDate = moment(competitions[i].endDate ?? "9999-12-31 23:59:59")
      .tz("Asia/Ulaanbaatar")
      .format("YYYY-MM-DD HH:mm:ss");

    if (moment(now).isBefore(moment(startDate))) {
      upcomingCompetitions.push(competitions[i]);
    } else if (moment(now).isAfter(moment(endDate))) {
      pastCompetitions.push(competitions[i]);
    } else {
      ongoingCompetitions.push(competitions[i]);
    }
  }

  const data = [
    { status: "now", data: ongoingCompetitions },
    { status: "soon", data: upcomingCompetitions },
    { status: "end", data: pastCompetitions },
  ];

  res.status(200).json({
    success: true,
    data: data,
  });
});

exports.getMatchesForReferee = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Referee']
  #swagger.summary = 'Get Matches for Referee'
  #swagger.description = 'Get matches for referee'
  #swagger.parameters['competitionId'] = { competitionId: "aaanhn" }
  #swagger.parameters['categoryId'] = { categoryId: "mmmhn" }
  */

  const { competitionId, categoryId } = req.query;

  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  const competition = await models.competition
    .findById({ _id: competitionId, referees: { $in: [token._id] } })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  const category = competition.categories.find(
    (item) => item._id.toString() === categoryId
  );
  if (!category) {
    throw new myError("Ангилал олдсонгүй.", 400);
  }

  const matches = await models.match
    .find(
      { competitionId: competitionId, categoryId: categoryId },
      { __v: 0, categoryId: 0, competitionId: 0, createdAt: 0 }
    )
    .populate({
      path: "playerOne",
      populate: {
        path: "userId",
        model: "user",
      },
    })
    .populate({
      path: "playerTwo",
      populate: {
        path: "userId",
        model: "user",
      },
    })
    .populate({
      path: "winner",
      populate: {
        path: "userId",
        model: "user",
      },
    })
    .sort({ round: 1, matchNumber: 1 })
    .lean();

  matches.forEach((match) => {
    match.playerOne = match.playerOne
      ? {
          _id: match.playerOne._id,
          firstName: match.playerOne.userId.firstName,
          lastName: match.playerOne.userId.lastName,
        }
      : null;
    match.playerTwo = match.playerTwo
      ? {
          _id: match.playerTwo._id,
          firstName: match.playerTwo.userId.firstName,
          lastName: match.playerTwo.userId.lastName,
        }
      : null;
    match.winner = match.winner
      ? {
          _id: match.winner._id,
          firstName: match.winner.userId.firstName,
          lastName: match.winner.userId.lastName,
        }
      : null;

    if (match.score) {
      Object.keys(match.score).forEach((key) => {
        if (key.toString() == match.playerOne._id.toString()) {
          match.score.playerOne = match.score[key];
          delete match.score[key];
        }
        if (key.toString() == match.playerTwo._id.toString()) {
          match.score.playerTwo = match.score[key];
          delete match.score[key];
        }
      });
    }
  });

  res.status(200).json({
    success: true,
    data: matches,
  });
});
