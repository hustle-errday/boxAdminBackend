const express = require("express");
const router = express.Router();
const {
  getParticipantList,
  getParticipant,
  validateParticipant,
  payCharge,
  rejectParticipant,
} = require("../../controller/participants");
const requestDataValidation = require("../../middleware/requestDataValidation");
const { body, query } = require("express-validator");

router
  .route("/get")
  .get(
    query("competitionId").isMongoId().notEmpty(),
    query("searchBy").isString().optional(),
    requestDataValidation,
    getParticipantList
  );
router
  .route("/participant")
  .get(
    query("_id").isMongoId().notEmpty(),
    requestDataValidation,
    getParticipant
  );
router
  .route("/validate")
  .post(
    body("_id").isMongoId().notEmpty(),
    body("isFixed").isBoolean().notEmpty(),
    body("data").optional(),
    requestDataValidation,
    validateParticipant
  );
router
  .route("/pay")
  .post(
    body("_id").isMongoId().notEmpty(),
    body("chargePaid").isBoolean().notEmpty(),
    requestDataValidation,
    payCharge
  );
router
  .route("/reject")
  .post(
    body("_id").isMongoId().notEmpty(),
    body("description").isString().optional(),
    requestDataValidation,
    rejectParticipant
  );

module.exports = router;
