const models = require("../models/models");
const moment = require("moment-timezone");
const cron = require("node-cron");

const byeParticipantNextRound = () => {
  cron.schedule("0 */1 * * *", async () => {
    const currentDate = moment().tz("Asia/Ulaanbaatar");

    const competitions = await models.competition
      .find({
        startDate: {
          $gte: currentDate
            .clone()
            .subtract(1, "hours")
            .format("YYYY-MM-DD HH:mm:ss"),
          $lte: currentDate
            .clone()
            .add(1, "hours")
            .format("YYYY-MM-DD HH:mm:ss"),
        },
      })
      .lean();

    console.log(
      "subtracttttt",
      currentDate.clone().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss")
    );
    console.log(
      "addddddddddd",
      currentDate.clone().add(1, "hours").format("YYYY-MM-DD HH:mm:ss")
    );

    if (competitions.length === 0) return;

    const competitionIds = competitions.map((competition) => competition._id);

    for (let i = 0; i < competitionIds.length; i++) {
      const competitionId = competitionIds[i];

      const categories = await models.category
        .find({ competitionId: competitionId })
        .lean();

      for (let j = 0; j < categories.length; j++) {
        const categoryId = categories[j]._id;

        const matches = await models.match
          .find({
            competitionId: competitionId,
            categoryId: categoryId,
            round: 1,
            $or: [{ playerOne: null }, { playerTwo: null }],
          })
          .sort({ round: 1, matchNumber: 1 })
          .lean();

        for (let k = 0; k < matches.length; k++) {
          const match = matches[k];

          let byePlayerId = null;

          if (match.playerOne === null && match.playerTwo) {
            byePlayerId = match.playerTwo;
          } else if (match.playerTwo === null && match.playerOne) {
            byePlayerId = match.playerOne;
          }

          if (byePlayerId) {
            const nextRoundMatchNumber = Math.ceil(match.matchNumber / 2);
            const nextRound = match.round + 1;

            const nextRoundMatch = await models.match.findOne({
              competitionId: competitionId,
              categoryId: categoryId,
              round: nextRound,
              matchNumber: nextRoundMatchNumber,
            });

            if (nextRoundMatch) {
              if (match.matchNumber % 2 === 1) {
                await models.match.updateOne(
                  { _id: nextRoundMatch._id },
                  { $set: { playerOne: byePlayerId } }
                );
              } else {
                await models.match.updateOne(
                  { _id: nextRoundMatch._id },
                  { $set: { playerTwo: byePlayerId } }
                );
              }
            }
          }
        }
      }
    }
  });
};

module.exports = {
  byeParticipantNextRound,
};
