const express = require("express");
const router = express.Router();
const {
  matching,
  getMatches,
  updateMatch,
  getMatchInfo,
  deleteMatch,
} = require("../../controller/match");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/matching")
  .post(
    body("competitionId").isString().notEmpty(),
    requestDataValidation,
    matching
  );
router
  .route("/get")
  .get(
    query("competitionId").isMongoId().notEmpty(),
    requestDataValidation,
    getMatches
  );
router.route("/update").put(updateMatch);
router
  .route("/info")
  .get(
    query("competitionId").isMongoId().notEmpty(),
    query("matchId").isMongoId().notEmpty(),
    requestDataValidation,
    getMatchInfo
  );
router
  .route("/delete")
  .delete(
    body("competitionId").isString().notEmpty(),
    requestDataValidation,
    deleteMatch
  );

module.exports = router;
