const express = require("express");
const router = express.Router();
const { matching } = require("../../controller/match");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/matching")
  .post(
    body("competitionId").isString().notEmpty(),
    requestDataValidation,
    matching
  );

module.exports = router;
