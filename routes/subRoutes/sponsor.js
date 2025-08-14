const express = require("express");
const router = express.Router();
const {
  getSponsors,
  addSponsor,
  updateSponsor,
  deleteSponsor,
} = require("../../controller/sponsor");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router.route("/get").get(getSponsors);
router
  .route("/add")
  .post(
    body("image").notEmpty().withMessage("Зураг хоосон байна."),
    body("link").notEmpty().withMessage("Холбоос хоосон байна."),
    body("isCollab")
      .notEmpty()
      .isBoolean()
      .withMessage("isCollab must be a boolean"),
    requestDataValidation,
    addSponsor
  );
router
  .route("/update")
  .put(
    body("_id").isString().notEmpty().withMessage("ID хоосон байна."),
    body("image").notEmpty().withMessage("Зураг хоосон байна."),
    body("link").notEmpty().withMessage("Холбоос хоосон байна."),
    body("isCollab")
      .notEmpty()
      .isBoolean()
      .withMessage("isCollab must be a boolean"),
    requestDataValidation,
    updateSponsor
  );
router
  .route("/delete")
  .delete(
    body("_id").isString().notEmpty().withMessage("ID хоосон байна."),
    requestDataValidation,
    deleteSponsor
  );

module.exports = router;
