const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");

exports.getInformation = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Information'] 
  #swagger.summary = 'Get information'
  #swagger.description = 'Get all information'
  */

  const information = await models.information.find({}, { __v: 0 }).lean();

  res.status(200).json({
    success: true,
    data: information,
  });
});

exports.addInformation = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Information']
  #swagger.summary = 'Add information'
  #swagger.description = 'Add new information'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Information data',
    required: true,
    schema: {
      image: 'https://example.com/image.jpg',
      link: 'https://example.com',
      title: 'New Information',
      content: 'This is the content of the new information.'
    }
  }
  */

  const { image, link, title, content } = req.body;

  if (!title || !content) {
    throw new myError("Гарчиг болон агуулга хоосон байж болохгүй.", 400);
  }

  const information = await models.information.create({
    image,
    link,
    title,
    content,
  });

  res.status(201).json({
    success: true,
    data: information,
  });
});

exports.updateInformation = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Information']
  #swagger.summary = 'Update information'
  #swagger.description = 'Update existing information'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Updated information data',
    required: true,
    schema: {
      _id: '60c72b2f9b1e8b001c8e4d3a',
      image: 'https://example.com/new-image.jpg',
      link: 'https://example.com/new-link',
      title: 'Updated Information Title',
      content: 'Updated content of the information.'
    }
  }
  */

  const { _id, image, link, title, content } = req.body;

  if (!title || !content) {
    throw new myError("Гарчиг болон агуулга хоосон байж болохгүй.", 400);
  }

  const information = await models.information.findByIdAndUpdate(
    _id,
    { image, link, title, content },
    { new: true, runValidators: true }
  );

  if (!information) {
    throw new myError("Мэдээ олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: information,
  });
});

exports.deleteInformation = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Information']
  #swagger.summary = 'Delete information'
  #swagger.description = 'Delete an existing information'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'ID of the information to delete',
    required: true,
    schema: {
      _id: '60c72b2f9b1e8b001c8e4d3a'
    }
  }
  */

  const { _id } = req.body;

  if (!_id) {
    throw new myError("ID хоосон байна.", 400);
  }

  const information = await models.information.findByIdAndDelete(_id);

  if (!information) {
    throw new myError("Мэдээ олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    message: "Мэдээ амжилттай устгагдлаа.",
  });
});
