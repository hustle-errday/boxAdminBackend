const express = require("express");
const router = express.Router();
const {
  createCompetition,
  getCompetitionList,
  getCompetition,
  updateCompetition,
  deleteCompetition,
} = require("../../controller/competition");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("typeId").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("categories").isArray().optional(),
    body("startDate").isString().notEmpty(),
    body("endDate").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("registrationStartDate").isString().notEmpty(),
    body("registrationDeadline").isString().notEmpty(),
    body("charge").isNumeric().optional(),
    body("chargeDeadline").isString().optional(),
    body("address").isString().optional(),
    body("banner").optional(),
    body("organizer").isString().optional(),
    requestDataValidation,
    createCompetition
  );
router.route("/get").get(getCompetitionList);
router
  .route("/competition")
  .get(
    query("_id").isMongoId().notEmpty(),
    requestDataValidation,
    getCompetition
  );
router
  .route("/update")
  .put(
    body("_id").isMongoId().notEmpty(),
    body("name").isString().notEmpty(),
    body("categories").isArray().optional(),
    body("startDate").isString().notEmpty(),
    body("endDate").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("registrationStartDate").isString().notEmpty(),
    body("registrationDeadline").isString().notEmpty(),
    body("charge").isNumeric().optional(),
    body("chargeDeadline").isString().optional(),
    body("address").isString().optional(),
    body("banner").optional(),
    body("organizer").isString().optional(),
    requestDataValidation,
    updateCompetition
  );
router
  .route("/delete")
  .delete(
    body("_id").isMongoId().notEmpty(),
    requestDataValidation,
    deleteCompetition
  );

module.exports = router;
