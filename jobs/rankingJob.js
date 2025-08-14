const models = require("../models/models");
const moment = require("moment-timezone");
const cron = require("node-cron");
const { trackScoreUpdate } = require("../myFunctions/rankingHelper");

const updateRankings = async () => {
  cron.schedule("0 0 * * *", async () => {
    // cron.schedule("* * * * *", async () => {
    // find non-finished competitions
    const competitions = await models.competition
      .find({ isOver: false, rankAffect: true })
      .lean();

    if (competitions.length === 0) return;

    for (const competition of competitions) {
      // endDate n 24 tsag dotor
      const endMoment = moment(competition.endDate).tz("Asia/Ulaanbaatar");
      const nowMoment = moment().tz("Asia/Ulaanbaatar");
      const diffHours = nowMoment.diff(endMoment, "hours");
      if (diffHours > 24) continue;

      console.log(`Updating rankings for competition: ${competition.name}`);

      // find categories associated with the competition
      const categories = await models.category
        .find({ _id: { $in: competition.categories } })
        .lean();

      for (const category of categories) {
        const isMatchOver = await models.match
          .findOne({
            competitionId: competition._id,
            categoryId: category._id,
            winner: { $exists: false },
          })
          .sort({ round: -1 })
          .lean();
        if (!isMatchOver) {
          const isRankingExists = await models.rankingActivity
            .findOne({
              categoryId: category._id,
              competitionId: competition._id,
              score: { $gte: 2 },
            })
            .lean();
          if (isRankingExists) {
            console.log(
              `Ranking activity already exists for category: ${category.name}. Skipping.`
            );
            continue;
          }

          // find first 3 matches of the category and update their scores
          const finalMatches = await models.match
            .find(
              {
                competitionId: competition._id,
                categoryId: category._id,
                winner: { $exists: true },
              },
              {
                winner: 1,
                playerOne: 1,
                playerTwo: 1,
                round: 1,
                matchNumber: 1,
              }
            )
            .populate({ path: "winner", populate: "userId" })
            .populate({ path: "playerOne playerTwo", populate: "userId" })
            .sort({ round: -1, matchNumber: 1 })
            .limit(3)
            .lean();
          // it means that there are no matches in this category
          if (finalMatches.length === 0) {
            continue;
          }

          if (finalMatches.length >= 1) {
            const goldMatch = finalMatches[0];
            const goldWinnerId = goldMatch?.winner?.userId?._id.toString();
            const goldLoserId =
              goldMatch?.playerOne?.userId?._id.toString() === goldWinnerId
                ? goldMatch?.playerTwo?.userId?._id.toString()
                : goldMatch?.playerOne?.userId?._id.toString();

            const updatingData = {
              _id: finalMatches[0]._id,
              categoryId: category._id,
              matchId: finalMatches[0]._id,
              competitionId: { _id: competition._id },
            };

            if (goldWinnerId)
              await trackScoreUpdate(updatingData, goldWinnerId, 10);
            if (goldLoserId)
              await trackScoreUpdate(updatingData, goldLoserId, 5);
          }
          if (finalMatches.length >= 2) {
            for (let i = 1; i < finalMatches.length; i++) {
              const bronzeMatch = finalMatches[i];
              const bronzeLoserId =
                bronzeMatch?.playerOne?.userId?._id.toString() ===
                bronzeMatch?.winner?.userId?._id.toString()
                  ? bronzeMatch?.playerTwo?.userId?._id.toString()
                  : bronzeMatch?.playerOne?.userId?._id.toString();

              const updatingData = {
                _id: finalMatches[i]._id,
                categoryId: category._id,
                matchId: finalMatches[i]._id,
                competitionId: { _id: competition._id },
              };

              if (bronzeLoserId)
                await trackScoreUpdate(updatingData, bronzeLoserId, 2);
            }
          }
        }

        // update places
        const updatedRankings = await models.ranking
          .find({ categoryId: category._id })
          .sort({ updatedScore: -1 })
          .lean();

        // update places
        for (let i = 0; i < updatedRankings.length; i++) {
          const newPlace = i + 1;
          const oldPlace = updatedRankings[i].place ?? 0;

          let move = "same";
          let moveBy = 0;
          if (oldPlace !== newPlace) {
            moveBy = Math.abs(newPlace - oldPlace);
            if (newPlace > oldPlace) {
              move = "up";
            } else if (newPlace < oldPlace) {
              move = "down";
            }
          }

          await models.ranking.updateOne(
            { _id: updatedRankings[i]._id },
            {
              $set: {
                place: newPlace,
                move: move,
                moveBy: moveBy,
                score: updatedRankings[i].updatedScore,
              },
            }
          );
        }
      }
    }

    console.log("Ranking update job completed");
  });
};

module.exports = { updateRankings };
