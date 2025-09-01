const express = require("express");
const router = express.Router();

const typeRoutes = require("./subRoutes/type");
const clubRoutes = require("./subRoutes/club");
const userRoutes = require("./subRoutes/users");
const videoRoutes = require("./subRoutes/video");
const imageRoutes = require("./subRoutes/image");
const fightRoutes = require("./subRoutes/fight");
const matchingRoutes = require("./subRoutes/match");
const sponsorRoutes = require("./subRoutes/sponsor");
const rankingRoutes = require("./subRoutes/ranking");
const refereeRoutes = require("./subRoutes/referee");
const categoryRoutes = require("./subRoutes/category");
const adminRoutes = require("./subRoutes/adminAccount");
const notifRoutes = require("./subRoutes/notification");
const competitionRoutes = require("./subRoutes/competition");
const informationRoutes = require("./subRoutes/information");
const participantRoutes = require("./subRoutes/participants");

router.use("/type", typeRoutes);
router.use("/club", clubRoutes);
router.use("/user", userRoutes);
router.use("/fight", fightRoutes);
router.use("/image", imageRoutes);
router.use("/admin", adminRoutes);
router.use("/notif", notifRoutes);
router.use("/video", videoRoutes);
router.use("/match", matchingRoutes);
router.use("/referee", refereeRoutes);
router.use("/ranking", rankingRoutes);
router.use("/sponsor", sponsorRoutes);
router.use("/info", informationRoutes);
router.use("/category", categoryRoutes);
router.use("/competition", competitionRoutes);
router.use("/participant", participantRoutes);

module.exports = router;
