const models = require("../models/models");

const trackScoreUpdate = async (match, winner, score) => {
  try {
    const existingRank = await models.ranking
      .findOne({
        categoryId: match.categoryId,
        userId: winner,
      })
      .lean();
    if (existingRank) {
      await models.ranking.updateOne(
        { _id: existingRank._id },
        {
          $inc: {
            updatedScore: score ?? 1,
          },
        }
      );
      await models.rankingActivity.create({
        competitionId: match.competitionId._id,
        categoryId: match.categoryId,
        matchId: match._id,
        userId: winner,
        score: score ?? 1,
      });
    } else {
      await models.ranking.create({
        categoryId: match.categoryId,
        userId: winner,
        updatedScore: score ?? 1,
      });
      await models.rankingActivity.create({
        competitionId: match.competitionId._id,
        categoryId: match.categoryId,
        matchId: match._id,
        userId: winner,
        score: score ?? 1,
      });
    }
  } catch (error) {
    console.error("Error tracking score update:", error);
  }
};

module.exports = { trackScoreUpdate };
