const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const jwt = require("jsonwebtoken");
const { transformData } = require("../myFunctions/competitionHelper");

// @todo busnii ungu nemeheer yaj oruulahiin boldoo rank nemeh yum bolowuu tegjaagaad

exports.createCategory = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Category']
  #swagger.summary = 'Create Category'
  #swagger.description = 'Create category'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Category data',
    schema: { 
      typeId: '60f4f2c4a4c6b80015f6f5a9',
      name: 'Өсвөр нас /8-9/ кг',
      sex: 'male/female/both',
      age: '8-10',
      weight: '24',
      height: '160',
    }
  }
  */

  const { typeId, name, sex, age, weight, height } = req.body;
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);

  const theType = await models.type.findById({ _id: typeId }).lean();
  if (!theType) {
    throw new myError("Төрөл олдсонгүй.", 400);
  }

  const checkDuplicate = await models.category.findOne({ name }).lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  const category = await models.category.create({
    typeId,
    name,
    sex,
    age,
    weight,
    height,
    createdBy: token._id,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.getCategoryList = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Category']
  #swagger.summary = 'Get Category List'
  #swagger.description = 'Get category list'
  #swagger.parameters['typeId'] = { typeId: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { typeId } = req.query;

  const categoryList = await models.category
    .find({ typeId: typeId }, { __v: 0 })
    .sort({ _id: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: categoryList,
  });
});

exports.getCategoryListByCategory = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Category']
  #swagger.summary = 'Get Category List By Category'
  #swagger.description = 'Get category list by category'
  #swagger.parameters['competitionId'] = { competitionId: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { competitionId } = req.query;

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }

  const data = [];
  for (let i = 0; i < competition.categories.length; i++) {
    const category = await models.category
      .findById({ _id: competition.categories[i] })
      .lean();
    if (!category) {
      throw new myError("Тэмцээн доторх ангилал олдсонгүй.", 400);
    }

    data.push(category);
  }

  const transformedData = await transformData(data);

  res.status(200).json({
    success: true,
    data: transformedData,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Category']
  #swagger.summary = 'Update Category'
  #swagger.description = 'Update category'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Category data',
    schema: { 
      _id: '60f4f2c4a4c6b80015f6f5a9',
      name: 'Өсвөр нас /8-9/ кг',
      sex: 'male',
      age: '8-10',
      weight: '24',
      height: '160',
    }
  }
  */

  const { _id, name, sex, age, weight, height } = req.body;

  const checkDuplicate = await models.category
    .findOne({ _id: { $ne: _id }, name })
    .lean();
  if (checkDuplicate) {
    throw new myError("Нэр давхардсан байна.", 400);
  }

  const category = await models.category.findByIdAndUpdate(
    _id,
    { name, sex, age, weight, height },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  // deleted schema d hiihuu yariltsah

  res.status(200).json({
    success: true,
    data: "not ready",
  });
});
