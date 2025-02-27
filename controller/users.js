const asyncHandler = require("../middleware/asyncHandler");
const models = require("../models/models");
const jwt = require("jsonwebtoken");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Users']
  #swagger.summary = 'Get All Users'
  #swagger.description = 'Get all users'
  #swagger.parameters['page'] = {
    in: 'query',
    description: 'page number',
    required: true
  }
  #swagger.parameters['searchBy'] = {
    in: 'query',
    description: 'search by name and phone number',
  }
  */

  const { page, searchBy } = req.query;
  const pageNumber = parseInt(page);
  const PAGE_DATA = 20;

  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const dataLength = await models.user
    .find({
      $or: [
        { firstName: { $regex: searchBy ?? "", $options: "si" } },
        { lastName: { $regex: searchBy ?? "", $options: "si" } },
        { phoneNo: { $regex: searchBy ?? "", $options: "si" } },
      ],
    })
    .countDocuments();

  const users = await models.user
    .find(
      {
        $or: [
          { firstName: { $regex: searchBy ?? "", $options: "si" } },
          { lastName: { $regex: searchBy ?? "", $options: "si" } },
          { phoneNo: { $regex: searchBy ?? "", $options: "si" } },
        ],
      },
      { __v: 0, password: 0 }
    )
    .populate("club", "name")
    .sort({ _id: -1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  users.forEach((user) => {
    user.club ? user.club.name : "";
  });

  res.status(200).json({
    success: true,
    data: users,
    dataLength: dataLength,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});

exports.getAllCoaches = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Users']
  #swagger.summary = 'Get All Coaches'
  #swagger.description = 'Get all coaches'
  #swagger.parameters['page'] = {
    in: 'query',
    description: 'page number',
    required: true
  }
  #swagger.parameters['searchBy'] = {
    in: 'query',
    description: 'search by name and phone number',
  }
  */

  const { page, searchBy } = req.query;
  const pageNumber = parseInt(page);
  const PAGE_DATA = 20;

  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const dataLength = await models.user
    .find({
      role: "coach",
      $or: [
        { firstName: { $regex: searchBy ?? "", $options: "si" } },
        { lastName: { $regex: searchBy ?? "", $options: "si" } },
        { phoneNo: { $regex: searchBy ?? "", $options: "si" } },
      ],
    })
    .countDocuments();

  const userList = await models.user
    .find(
      {
        role: "coach",
        $or: [
          { firstName: { $regex: searchBy ?? "", $options: "si" } },
          { lastName: { $regex: searchBy ?? "", $options: "si" } },
          { phoneNo: { $regex: searchBy ?? "", $options: "si" } },
        ],
      },
      { __v: 0, password: 0 }
    )
    .populate("club", "name")
    .sort({ _id: -1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  userList.forEach((user) => {
    user.club ? user.club.name : "";
  });

  res.status(200).json({
    success: true,
    data: userList,
    dataLength: dataLength,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});

exports.getAllAthletes = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Users']
  #swagger.summary = 'Get All Athletes'
  #swagger.description = 'Get all athletes'
  #swagger.parameters['page'] = {
    in: 'query',
    description: 'page number',
    required: true
  }
  #swagger.parameters['searchBy'] = {
    in: 'query',
    description: 'search by name and phone number',
  }
  */

  const { page, searchBy } = req.query;
  const pageNumber = parseInt(page);
  const PAGE_DATA = 20;

  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const dataLength = await models.user
    .find({
      role: "athlete",
      $or: [
        { firstName: { $regex: searchBy ?? "", $options: "si" } },
        { lastName: { $regex: searchBy ?? "", $options: "si" } },
        { phoneNo: { $regex: searchBy ?? "", $options: "si" } },
      ],
    })
    .countDocuments();

  const userList = await models.user
    .find(
      {
        role: "athlete",
        $or: [
          { firstName: { $regex: searchBy ?? "", $options: "si" } },
          { lastName: { $regex: searchBy ?? "", $options: "si" } },
          { phoneNo: { $regex: searchBy ?? "", $options: "si" } },
        ],
      },
      { __v: 0, password: 0 }
    )
    .populate("club", "name")
    .sort({ _id: -1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  userList.forEach((user) => {
    user.club ? user.club.name : "";
  });

  res.status(200).json({
    success: true,
    data: userList,
    dataLength: dataLength,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});
