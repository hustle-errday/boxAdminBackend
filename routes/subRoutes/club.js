const express = require("express");
const router = express.Router();
const {
  createClub,
  setCoachToClub,
  removeCoachFromClub,
  getClubList,
  getAllClubList,
  updateClub,
  deleteClub,
} = require("../../controller/club");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router.route("/create").post(
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Create Club'
  #swagger.description = 'Create club'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Club data',
    schema: { 
      name: 'name',
      description: 'description',
      address: 'address',
      phone: 'phone',
      coach: ['coach', 'coach'],
      logo: 'logo',
    }
  }
  */
  body("name").isString().notEmpty(),
  body("description").isString().optional(),
  body("address").isString().optional(),
  body("phone").isString().optional(),
  body("coach").isArray().optional(),
  body("logo").isString().optional(),
  requestDataValidation,
  createClub
);
router.route("/set_coach").post(
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Set Coach To Club'
  #swagger.description = 'Set coach to club'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Club data',
    schema: { 
      clubId: 'clubId',
      userId: 'userId',
    }
  }
  */

  body("clubId").isString().notEmpty(),
  body("userId").isString().notEmpty(),
  requestDataValidation,
  setCoachToClub
);
router.route("/remove_coach").delete(
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Remove Coach From Club'
  #swagger.description = 'Remove Coach From Club'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Remove Coach From Club',
    required: true,
    schema: {
      clubId: '60f4f2c4a4c6b80015f6f5a9',
      userId: '60f4f2c4a4c6b80015f6f5a9'
    }
  }
  */

  body("clubId").isString().notEmpty(),
  body("userId").isString().notEmpty(),
  requestDataValidation,
  removeCoachFromClub
);
router.route("/get").get(
  /*
      #swagger.tags = ['Club']
      #swagger.summary = 'Get Club List'
      #swagger.description = 'Get club list'
      #swagger.parameters['page'] = {
        in: 'query',
        description: 'Page number',
        required: true
      }
      #swagger.parameters['name'] = {
        in: 'query',
        description: 'Search by name',
      }
      */
  query("page").isNumeric().notEmpty(),
  query("name").isString().optional(),
  requestDataValidation,
  getClubList
);
router.route("/all").get(
  /*
    #swagger.tags = ['Club']
    #swagger.summary = 'Get All Club List'
    #swagger.description = 'Get all club list'
  */
  getAllClubList
);
router.route("/update").put(
  /*
  #swagger.tags = ['Club']
  #swagger.summary = 'Update Club'
  #swagger.description = 'Update club'
  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'Club data',
    schema: { 
      _id: 'club_id',
      name: 'name',
      description: 'description',
      address: 'address',
      phone: 'phone',
      coach: ['coach', 'coach'],
      logo: 'logo',
    }
  }
  */
  body("_id").isString().notEmpty(),
  body("name").isString().notEmpty(),
  body("description").isString().optional(),
  body("address").isString().optional(),
  body("phone").isString().optional(),
  body("coach").isArray().optional(),
  body("logo").isString().optional(),
  requestDataValidation,
  updateClub
);
router
  .route("/delete")
  .delete(body("_id").isString().notEmpty(), requestDataValidation, deleteClub);

module.exports = router;
