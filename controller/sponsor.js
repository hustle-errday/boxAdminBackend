const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");

exports.getSponsors = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Sponsor'] 
  #swagger.summary = 'Get sponsors'
  #swagger.description = 'Get all sponsors'
  */

  const sponsors = await models.sponsor.find({}, { __v: 0 }).lean();

  res.status(200).json({
    success: true,
    data: sponsors,
  });
});

exports.addSponsor = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Sponsor']
  #swagger.summary = 'Add sponsor'
  #swagger.description = 'Add a new sponsor'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Sponsor data',
    required: true,
    schema: {
      image: 'https://example.com/image.jpg',
      link: 'https://example.com',
      isCollab: true
    }
  }
  */

  const { image, link, isCollab } = req.body;

  if (!image || !link) {
    throw new myError("Зураг болон холбоос хоосон байна.", 400);
  }

  const sponsor = await models.sponsor.create({
    image,
    link,
    isCollab,
  });

  res.status(201).json({
    success: true,
    data: sponsor,
  });
});

exports.updateSponsor = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Sponsor']
  #swagger.summary = 'Update sponsor'
  #swagger.description = 'Update an existing sponsor'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Sponsor data',
    required: true,
    schema: {
      _id: '60f4f2c4a4c6b80015f6f5a9',
      image: 'https://example.com/image.jpg',
      link: 'https://example.com',
      isCollab: true
    }
  }
  */

  const { _id, image, link, isCollab } = req.body;

  if (!image || !link) {
    throw new myError("Зураг болон холбоос хоосон байна.", 400);
  }

  const sponsor = await models.sponsor.findByIdAndUpdate(
    _id,
    { image, link, isCollab },
    { new: true }
  );

  if (!sponsor) {
    throw new myError("Спонсор олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: sponsor,
  });
});

exports.deleteSponsor = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Sponsor']
  #swagger.summary = 'Delete sponsor'
  #swagger.description = 'Delete an existing sponsor'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Sponsor ID',
    required: true,
    schema: {
      _id: '60f4f2c4a4c6b80015f6f5a9'
    }
  }
  */

  const { _id } = req.body;

  const sponsor = await models.sponsor.findByIdAndDelete(_id);

  if (!sponsor) {
    throw new myError("Спонсор олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    message: "Спонсор амжилттай устгагдлаа.",
  });
});
