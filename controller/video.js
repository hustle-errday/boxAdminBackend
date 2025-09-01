const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");

exports.createVideo = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Video']
  #swagger.summary = 'Create Video'
  #swagger.description = 'Create video'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Video data',
    schema: { 
      title: 'title',
      url: 'url',
      description: 'description',
    }
  }
  */

  const { title, url, description } = req.body;

  if (!title || !url) {
    throw new myError("Гарчиг болон URL оруулна уу.", 400);
  }

  const video = await models.video.create({
    title,
    url,
    description,
  });

  res.status(200).json({
    success: true,
    data: video,
  });
});

exports.getVideos = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Video']
  #swagger.summary = 'Get Videos'
  #swagger.description = 'Get videos'
  */

  const videos = await models.video.find().sort({ _id: -1 }).lean();

  res.status(200).json({
    success: true,
    dataLength: videos.length,
    data: videos,
  });
});

exports.updateVideo = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Video']
  #swagger.summary = 'Update Video'
  #swagger.description = 'Update video'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Video data',
    schema: { 
      _id: 'videoId',
      title: 'title',
      url: 'url',
      description: 'description',
    }
  }
  */

  const { _id, title, url, description } = req.body;

  if (!_id || !title || !url) {
    throw new myError("ID, гарчиг болон URL оруулна уу.", 400);
  }

  const video = await models.video.findByIdAndUpdate(
    _id,
    { title, url, description },
    { new: true }
  );

  if (!video) {
    throw new myError("Видео олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: video,
  });
});

exports.deleteVideo = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Video']
  #swagger.summary = 'Delete Video'
  #swagger.description = 'Delete video'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Video data',
    schema: { 
      _id: 'videoId',
    }
  }
  */

  const { _id } = req.body;

  if (!_id) {
    throw new myError("ID оруулна уу.", 400);
  }

  const video = await models.video.findByIdAndDelete(_id);

  if (!video) {
    throw new myError("Видео олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: video,
  });
});
