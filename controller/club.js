const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

// @todo club uudiig temtseend oruulna admin aas

exports.createClub = asyncHandler(async (req, res, next) => {
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

exports.setCoachToClub = asyncHandler(async (req, res, next) => {
  const { clubId, userId } = req.body;

  const theClub = await models.club.findOne({ _id: clubId });
  if (!theClub) {
    throw new myError("Клубын мэдээлэл олдсонгүй.", 400);
  }

  const theUser = await models.user.findOne({ _id: userId }).lean();
  if (!theUser) {
    throw new myError("Хэрэглэгчийн мэдээлэл олдсонгүй.", 400);
  }

  // Check if user is already a coach in this club
  if (theClub.coach.includes(userId)) {
    throw new myError("Хэрэглэгч аль хэдийн уг клубт багшилж байна.", 400);
  }

  // Log if the user was previously part of another club
  if (theUser.club) {
    await models.clubLog.create({
      clubId: theUser.club,
      userId: userId,
      joinAs: "coach",
      action: "leave",
    });

    await models.club.updateOne(
      { _id: theUser.club },
      {
        $pull: { coach: userId },
      }
    );
  }

  // Add user to club as a coach
  await models.club.updateOne(
    { _id: clubId },
    { $addToSet: { coach: userId } }
  );

  // Log the user's addition to the club
  await models.clubLog.create({
    clubId: clubId,
    userId: userId,
    joinAs: "coach",
    action: "join",
  });

  await models.user.updateOne({ _id: userId }, { club: clubId, role: "coach" });

  res.status(200).json({
    success: true,
  });
});

exports.removeCoachFromClub = asyncHandler(async (req, res, next) => {
  const { clubId, userId } = req.body;

  const theClub = await models.club.findOne({ _id: clubId });
  if (!theClub) {
    throw new myError("Клубын мэдээлэл олдсонгүй.", 400);
  }

  const theUser = await models.user.findOne({ _id: userId }).lean();
  if (!theUser) {
    throw new myError("Хэрэглэгчийн мэдээлэл олдсонгүй.", 400);
  }

  // check if user is not a coach in this club
  if (!theClub.coach.includes(userId)) {
    throw new myError("Хэрэглэгч энэ клубт хамаараагүй байна.", 400);
  }

  // log
  await models.clubLog.create({
    clubId: clubId,
    userId: userId,
    joinAs: "coach",
    action: "leave",
  });

  // remove user from club as a coach
  await models.club.updateOne(
    {
      _id: clubId,
    },
    {
      $pull: { coach: userId },
    }
  );

  // remove user from club as a coach
  await models.user.updateOne({ _id: userId }, { club: null });

  res.status(200).json({
    success: true,
    data: "Амжилттай.",
  });
});

exports.getClubList = asyncHandler(async (req, res, next) => {
  const { page, name } = req.query;
  const pageNumber = parseInt(page);
  const PAGE_DATA = 20;

  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const allClubs = await models.club
    .find({ name: { $regex: name ?? "", $options: "si" } })
    .countDocuments();

  const clubList = await models.club
    .find({ name: { $regex: name ?? "", $options: "si" } }, { __v: 0 })
    .populate("createdBy", "username")
    .populate("coach", "firstName lastName")
    .sort({ _id: -1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  clubList.forEach((club) => {
    club.createdBy = club.createdBy.username;
    club.coach
      ? (club.coach = club.coach.map((c) => ({
          _id: c._id,
          name: `${c.firstName} ${c.lastName}`,
          phoneNo: c.phoneNo,
        })))
      : [];
  });

  res.status(200).json({
    success: true,
    data: clubList,
    dataLength: allClubs,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});

exports.getAllClubList = asyncHandler(async (req, res, next) => {
  const clubList = await models.club
    .find({}, { name: 1, _id: 1 })
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    data: clubList,
  });
});

exports.updateClub = asyncHandler(async (req, res, next) => {
  const { _id, name, description, address, phone, coach, logo } = req.body;

  const checkDuplicate = await models.club
    .findOne({ name, _id: { $ne: _id } })
    .lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  await models.club.findOneAndUpdate(
    { _id: _id },
    {
      name,
      description,
      address,
      phone,
      coach,
      logo,
    }
  );

  const club = await models.club
    .findOne({ _id: _id })
    .populate("coach", "firstName lastName")
    .lean();

  club.coach = club.coach.map((c) => ({
    _id: c._id,
    firstName: c.firstName,
    lastName: c.lastName,
  }));

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
