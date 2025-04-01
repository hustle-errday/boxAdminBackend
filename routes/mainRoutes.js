const express = require("express");
const router = express.Router();

const typeRoutes = require("./subRoutes/type");
const clubRoutes = require("./subRoutes/club");
const userRoutes = require("./subRoutes/users");
const imageRoutes = require("./subRoutes/image");
const fightRoutes = require("./subRoutes/fight");
const matchingRoutes = require("./subRoutes/match");
const refereeRoutes = require("./subRoutes/referee");
const categoryRoutes = require("./subRoutes/category");
const adminRoutes = require("./subRoutes/adminAccount");
const competitionRoutes = require("./subRoutes/competition");
const participantRoutes = require("./subRoutes/participants");

router.use("/type", typeRoutes);
router.use("/club", clubRoutes);
router.use("/user", userRoutes);
router.use("/fight", fightRoutes);
router.use("/image", imageRoutes);
router.use("/admin", adminRoutes);
router.use("/match", matchingRoutes);
router.use("/referee", refereeRoutes);
router.use("/category", categoryRoutes);
router.use("/competition", competitionRoutes);
router.use("/participant", participantRoutes);

module.exports = router;
