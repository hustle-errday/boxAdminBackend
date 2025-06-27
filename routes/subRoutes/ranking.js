const express = require("express");
const router = express.Router();
const {
  getParticipantRanking,
  getClubRanking,
  getParticipantRankingMore,
  getRankingDetails,
  getClubDetails,
} = require("../../controller/ranking");
const requestDataValidation = require("../../middleware/requestDataValidation");
const { body, query } = require("express-validator");

router
  .route("/participant")
  .get(
    query("typeId").isMongoId().notEmpty(),
    query("sex").isIn(["male", "female"]).notEmpty(),
    requestDataValidation,
    getParticipantRanking
  );
router.route("/club").get(getClubRanking);
router
  .route("/more")
  .get(
    query("categoryId").isMongoId().notEmpty(),
    query("page").isNumeric().notEmpty(),
    query("search").isString().optional(),
    requestDataValidation,
    getParticipantRankingMore
  );
router
  .route("/details")
  .get(
    query("rankingId").isMongoId().notEmpty(),
    requestDataValidation,
    getRankingDetails
  );
router
  .route("/club_detail")
  .get(
    query("clubId").isMongoId().notEmpty(),
    requestDataValidation,
    getClubDetails
  );

module.exports = router;
