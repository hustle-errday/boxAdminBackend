const { validationResult } = require("express-validator");

//this function checks if the provided data in request is valid or not
const requestDataValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array(),
    });
  } else {
    next();
  }
};

module.exports = requestDataValidation;
