const express = require("express");
const router = express.Router();
const {
  createReferee,
  changeRefereePassword,
  getRefereeList,
  putRefereeInCompetition,
} = require("../../controller/referee");
const requestDataValidation = require("../../middleware/requestDataValidation");
const { body, query } = require("express-validator");

router
  .route("/create")
  .post(
    body("firstName").isString().notEmpty(),
    body("lastName").isString().notEmpty(),
    body("phoneNo")
      .isString()
      .isLength({ min: 8, max: 8 })
      .withMessage("Утасны дугаар буруу байна")
      .notEmpty(),
    body("password").isString().notEmpty(),
    requestDataValidation,
    createReferee
  );
router
  .route("/password")
  .post(
    body("phoneNo")
      .isString()
      .isLength({ min: 8, max: 8 })
      .withMessage("Утасны дугаар буруу байна")
      .notEmpty(),
    body("newPassword").isString().notEmpty(),
    requestDataValidation,
    changeRefereePassword
  );
router
  .route("/list")
  .get(
    query("page").isNumeric().notEmpty(),
    requestDataValidation,
    getRefereeList
  );
router
  .route("/put")
  .put(
    body("refereeId").isArray().notEmpty(),
    body("competitionId").isString().notEmpty(),
    requestDataValidation,
    putRefereeInCompetition
  );

module.exports = router;
