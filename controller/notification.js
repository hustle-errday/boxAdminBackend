const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");
const { sendNotification } = require("../config/notification");

exports.sendPublicNotif = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Notification']
  #swagger.summary = 'Send public notification'
  #swagger.description = 'Send public notification'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Message to send',
    schema: {
      "title": "Notification title",
      "body": "Notification body"
    }
  }
  */

  const { title, body } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  if (!token) {
    return new myError("Токен байхгүй байна", 400);
  }
  if (!title || !body) {
    return new myError("Мэдээлэл дутуу байна", 400);
  }

  const admin = await models.admin.findOne({
    _id: token._id,
    $or: [{ phoneNo: "91927011" }, { phoneNo: "99076845" }],
  });
  if (!admin) {
    return new myError("Танд уг үйлдлийг хийх эрх байхгүй байна", 400);
  }

  const tokens = await models.notifToken
    .find({
      notifKey: { $ne: null },
    })
    .lean();

  for (let i = 0; i < tokens.length; i++) {
    await sendNotification(tokens[i].notifKey, title, body);
  }

  await models.notifHistory.create({
    message: { title, body },
    notifType: "public",
    admin: token._id,
  });

  res.status(200).json({
    success: true,
    message: "Амжилттай",
  });
});

exports.sendPrivateNotif = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Notification']
  #swagger.summary = 'Send private notification'
  #swagger.description = 'Send private notification'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Message to send',
    schema: {
      "competitionId": "Competition id",
      "title": "Notification title",
      "body": "Notification body"
    }
  }
  */

  const { competitionId, title, body } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  if (!token) {
    return new myError("Токен байхгүй байна", 400);
  }
  if (!competitionId || !title || !body) {
    return new myError("Мэдээлэл дутуу байна", 400);
  }

  const admin = await models.admin
    .findOne({
      _id: token._id,
      $or: [{ phoneNo: "91927011" }, { phoneNo: "99076845" }],
    })
    .lean();
  if (!admin) {
    return new myError("Танд уг үйлдлийг хийх эрх байхгүй байна", 400);
  }

  const competition = await models.competition
    .findOne({
      _id: competitionId,
    })
    .lean();
  if (!competition) {
    return new myError("Тухайн тэмцээн байхгүй байна", 400);
  }

  const participants = await models.participant
    .find(
      {
        competitionId: competitionId,
      },
      { userId: 1 }
    )
    .lean();

  const userIds = participants.map((item) => item.userId);

  const tokens = await models.notifToken
    .find({
      userId: { $in: userIds },
      notifKey: { $ne: null },
    })
    .lean();

  for (let i = 0; i < tokens.length; i++) {
    await sendNotification(tokens[i].notifKey, title, body);
  }
  await models.notifHistory.create({
    message: { title, body },
    notifType: "private",
    competitionId: competitionId,
    admin: token._id,
  });

  res.status(200).json({
    success: true,
    message: "Амжилттай",
  });
});

exports.getNotifHistory = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Notification']
  #swagger.summary = 'Get notification history'
  #swagger.description = 'Get notification history'
  #swagger.parameters['page'] = {
    in: 'query',
    description: 'Page number',
    type: 'integer',
  }
  */

  const { page } = req.query;
  const pageNumber = parseInt(page);
  const PAGE_DATA = 10;
  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const allNotif = await models.notifHistory.find({}).countDocuments();

  const notifHistory = await models.notifHistory
    .find({}, { __v: 0 })
    .populate("admin", "username")
    .populate("competitionId", "name")
    .sort({ _id: -1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  notifHistory.forEach((notif) => {
    notif.admin = notif.admin.username;
    notif.competitionId
      ? (notif.competition = notif.competitionId.name)
      : (notif.competition = null);

    delete notif.competitionId;
  });

  res.status(200).json({
    success: true,
    data: notifHistory,
    dataLength: allNotif,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});
