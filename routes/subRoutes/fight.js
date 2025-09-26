const express = require("express");
const router = express.Router();
const { giveScore, endMatch, updateMatch } = require("../../controller/fight");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/score")
  .post(
    body("matchId").isMongoId().withMessage("Invalid matchId"),
    body("round").isNumeric().withMessage("Invalid round"),
    body("playerOne._id").isMongoId().withMessage("Invalid playerOne._id"),
    body("playerOne.score").isString().withMessage("Invalid playerOne.score"),
    body("playerTwo._id").isMongoId().withMessage("Invalid playerTwo._id"),
    body("playerTwo.score").isString().withMessage("Invalid playerTwo.score"),
    body("description").isArray().withMessage("Invalid description"),
    requestDataValidation,
    giveScore
  );
router
  .route("/ending")
  .post(
    body("matchId").isMongoId().withMessage("Invalid matchId"),
    requestDataValidation,
    endMatch
  );
router
  .route("/update")
  .post(
    body("matchId").isMongoId().withMessage("Invalid matchId"),
    body("round").isNumeric().withMessage("Invalid round"),
    body("playerOne._id").isMongoId().withMessage("Invalid playerOne._id"),
    body("playerOne.score").isString().withMessage("Invalid playerOne.score"),
    body("playerTwo._id").isMongoId().withMessage("Invalid playerTwo._id"),
    body("playerTwo.score").isString().withMessage("Invalid playerTwo.score"),
    body("description").isArray().withMessage("Invalid description"),
    requestDataValidation,
    updateMatch
  );

module.exports = router;
