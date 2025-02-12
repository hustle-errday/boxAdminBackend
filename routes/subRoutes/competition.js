const express = require("express");
const router = express.Router();
const {
  createCompetition,
  getCompetitionList,
  updateCompetition,
} = require("../../controller/competition");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("typeId").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("categories").isArray().optional(),
    body("startDate").isDate().notEmpty(),
    body("endDate").isDate().optional(),
    body("description").isString().notEmpty(),
    body("registrationStartDate").isDate().optional(),
    body("registrationDeadline").isDate().optional(),
    body("charge").isNumeric().optional(),
    body("chargeDeadline").isDate().optional(),
    body("address").isString().optional(),
    body("banner").optional(),
    body("organizer").isString().optional(),
    requestDataValidation,
    createCompetition
  );
router.route("/get").get(getCompetitionList);
router
  .route("/update")
  .put(
    body("_id").isMongoId().notEmpty(),
    body("name").isString().notEmpty(),
    body("categories").isArray().optional(),
    body("startDate").isDate().notEmpty(),
    body("endDate").isDate().optional(),
    body("description").isString().notEmpty(),
    body("registrationStartDate").isDate().optional(),
    body("registrationDeadline").isDate().optional(),
    body("charge").isNumeric().optional(),
    body("chargeDeadline").isDate().optional(),
    body("address").isString().optional(),
    body("banner").optional(),
    body("organizer").isString().optional(),
    requestDataValidation,
    updateCompetition
  );

module.exports = router;
