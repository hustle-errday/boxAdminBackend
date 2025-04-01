const express = require("express");
const router = express.Router();
const {
  createReferee,
  changeRefereePassword,
  getRefereeList,
  putRefereeInCompetition,
  searchReferee,
  getCompetitionsForReferee,
  getMatchesForReferee,
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
router
  .route("/search")
  .get(query("search").isString(), requestDataValidation, searchReferee);
router.route("/competitions").get(getCompetitionsForReferee);
router
  .route("/matches")
  .get(
    query("competitionId").isMongoId(),
    query("categoryId").isMongoId(),
    requestDataValidation,
    getMatchesForReferee
  );

module.exports = router;
