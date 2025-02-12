const express = require("express");
const router = express.Router();
const {
  createClub,
  getClubList,
  updateClub,
  deleteClub,
} = require("../../controller/club");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("name").isString().notEmpty(),
    body("description").isString().optional(),
    body("address").isString().optional(),
    body("phone").isString().optional(),
    body("coach").isString().optional(),
    body("logo").isString().optional(),
    requestDataValidation,
    createClub
  );
router.route("/get").get(getClubList);
router
  .route("/update")
  .put(
    body("_id").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("description").isString().optional(),
    body("address").isString().optional(),
    body("phone").isString().optional(),
    body("coach").isString().optional(),
    body("logo").isString().optional(),
    requestDataValidation,
    updateClub
  );

module.exports = router;
