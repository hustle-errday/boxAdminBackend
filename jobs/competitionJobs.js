const models = require("../models/models");
const moment = require("moment-timezone");
const cron = require("node-cron");

const byeParticipantNextRound = () => {
  cron.schedule("0 */1 * * *", async () => {
    const currentDate = moment().tz("Asia/Ulaanbaatar");

    const competitions = await models.competition.find({}).lean();

    if (competitions.length === 0) return;

    for (let i = 0; i < competitions.length; i++) {
      const competition = competitions[i];
      const startDate = moment(competition.startDate, "YYYY-MM-DD HH:mm:ss").tz(
        "Asia/Ulaanbaatar"
      );
      const startDatePlusOneHour = startDate.clone().add(1, "hours");

      if (currentDate.isSameOrAfter(startDatePlusOneHour)) {
        const categories = await models.category
          .find({ competitionId: competition._id })
          .lean();

        for (let j = 0; j < categories.length; j++) {
          const categoryId = categories[j]._id;

          const matches = await models.match
            .find({
              competitionId: competition._id,
              categoryId: categoryId,
              round: 1,
              $or: [{ playerOne: null }, { playerTwo: null }],
            })
            .sort({ matchNumber: 1 })
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
                competitionId: competition._id,
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
    }
  });
};

module.exports = {
  byeParticipantNextRound,
};
