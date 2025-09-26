const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const { trackScoreUpdate } = require("../myFunctions/rankingHelper");

exports.giveScore = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Fight'] 
  #swagger.summary = 'Give score'
  #swagger.description = 'Give score'
  #swagger.parameters['body'] = { 
    in: 'body',
    description: 'Give score data',
    required: true,
    schema: {
      matchId: '60f4f2c4a4c6b80015f6f5a9',
      round: 1,
      playerOne: {
        _id: '60f4f2c4a4c6b80015f6f5a9',
        score: "10 or K.O",
      },
      playerTwo: {
        _id: '60f4f2c4a4c6b80015f6f5a9',
        score: "9 or 0",
      }, 
      description: ['description', 'description', 'description'],
    }
  }
  */

  const { matchId, round, playerOne, playerTwo, description } = req.body;

  const token = jwt.decode(req.headers.authorization.split(" ")[1]);
  if (token.role !== "referee") {
    throw new myError("Зөвхөн шүүгч оноо өгнө.", 400);
  }

  const roundNumber = parseInt(round);
  if (![1, 2, 3, 4].includes(roundNumber)) {
    throw new myError("Round тодорхойгүй.", 400);
  }

  const participantIds = [playerOne._id, playerTwo._id];

  const [match, participants] = await Promise.all([
    models.match
      .findById({ _id: matchId })
      .populate("competitionId", "referees rankAffect")
      .lean(),
    models.participant.find({ _id: { $in: participantIds } }).lean(),
  ]);

  if (!match) {
    throw new myError("Тоглолт олдсонгүй.", 400);
  }
  if (match.refereeCount && Object.keys(match.refereeCount).length === 3) {
    throw new myError("3 шүүгч дуусгах саналаа өгсөн байна.", 400);
  }
  if (participants.length !== 2) {
    throw new myError("Тоглогч олдсонгүй.", 400);
  }
  const referees = match.competitionId.referees?.map((ref) => ref.toString());
  if (!referees.includes(token._id.toString())) {
    throw new myError("Тэмцээнд харьяалагдаагүй шүүгч байна.", 400);
  }
  if (
    ![match.playerOne.toString(), match.playerTwo.toString()].includes(
      playerOne._id
    ) ||
    ![match.playerOne.toString(), match.playerTwo.toString()].includes(
      playerTwo._id
    )
  ) {
    throw new myError("Аль нэг тоглогч энэ тоглолтонд хамаараагүй байна.", 400);
  }
  if (playerOne.score === "K.O" && playerTwo.score === "K.O") {
    throw new myError("K.O хоёр тоглогч байх боломжгүй.", 400);
  }

  const newScores = {};
  if (playerOne.score === "K.O" || playerTwo.score === "K.O") {
    const winner = playerOne.score === "K.O" ? playerOne._id : playerTwo._id;
    const scoringPlayer = playerOne.score === "K.O" ? playerOne : playerTwo;

    newScores[`score.${scoringPlayer._id}.round${roundNumber}.${token._id}`] = {
      score: "K.O",
      description,
    };

    match.refereeCount = match.refereeCount || {};
    match.refereeCount[token._id] = true;
    const count = Object.keys(match.refereeCount).length;

    const updateData = {
      ...newScores,
      refereeCount: match.refereeCount,
    };

    if (count === 3) {
      updateData.matchDateTime = moment
        .tz("Asia/Ulaanbaatar")
        .format("YYYY-MM-DD HH:mm:ss");
      updateData.winner = winner;

      // logic to move winner to the next round
      const nextRoundMatchNumber = Math.ceil(match.matchNumber / 2);
      const nextRound = match.round + 1;

      const nextRoundMatch = await models.match.findOne({
        competitionId: match.competitionId,
        categoryId: match.categoryId,
        round: nextRound,
        matchNumber: nextRoundMatchNumber,
      });

      if (nextRoundMatch) {
        if (match.matchNumber % 2 === 1) {
          // winner goes to playerOne
          await models.match.updateOne(
            {
              _id: nextRoundMatch._id,
            },
            { $set: { playerOne: winner } }
          );
        } else {
          // winner goes to playerTwo
          await models.match.updateOne(
            {
              _id: nextRoundMatch._id,
            },
            { $set: { playerTwo: winner } }
          );
        }
      }

      // ranking section
      if (match.competitionId.rankAffect) {
        await trackScoreUpdate(match, winner);
      }
    }

    await models.match.updateOne({ _id: matchId }, { $set: updateData });

    return res.status(200).json({
      success: true,
    });
  }

  newScores[`score.${playerOne._id}.round${roundNumber}.${token._id}`] = {
    score: playerOne.score,
    description,
  };
  newScores[`score.${playerTwo._id}.round${roundNumber}.${token._id}`] = {
    score: playerTwo.score,
    description,
  };

  await models.match.updateOne({ _id: matchId }, { $set: newScores });

  res.status(200).json({
    success: true,
  });
});

exports.endMatch = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Fight']
  #swagger.summary = 'End Match'
  #swagger.description = 'End Match'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'End Match data',
    required: true,
    schema: {
      matchId: '60f4f2c4a4c6b80015f6f5a9',
    }
  }
  */

  const { matchId } = req.body;

  const token = jwt.decode(req.headers.authorization.split(" ")[1]);
  if (token.role !== "referee") {
    throw new myError("Зөвхөн шүүгч дуусгах боломжтой.", 400);
  }

  const match = await models.match
    .findById({ _id: matchId })
    .populate("competitionId", "referees rankAffect")
    .lean();

  if (!match) {
    throw new myError("Тоглолт олдсонгүй.", 400);
  }
  if (match.refereeCount && Object.keys(match.refereeCount).length === 3) {
    throw new myError("3 шүүгч дуусгах саналаа өгсөн байна.", 400);
  }
  if (
    !match.competitionId.referees.some(
      (ref) => ref.toString() === token._id.toString()
    )
  ) {
    throw new myError("Тэмцээнд харьяалагдаагүй шүүгч байна.", 400);
  }
  if (match.refereeCount?.[token._id]) {
    throw new myError("Та энэ тоглолтонд дуусгах санал өгсөн байна.", 400);
  }

  match.refereeCount = match.refereeCount || {};
  match.refereeCount[token._id] = true;

  const count = Object.keys(match.refereeCount).length;

  // if count === 3 then calculate winner, it means match ended
  if (count === 3) {
    const scores = match.score;
    const now = moment.tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");

    const playerOneScores = Object.values(scores[match.playerOne]);
    const playerTwoScores = Object.values(scores[match.playerTwo]);

    const playerOneTotal = playerOneScores.reduce((acc, cur) => {
      return (
        acc +
        Object.values(cur).reduce((sum, val) => sum + parseInt(val.score), 0)
      );
    }, 0);
    const playerTwoTotal = playerTwoScores.reduce((acc, cur) => {
      return (
        acc +
        Object.values(cur).reduce((sum, val) => sum + parseInt(val.score), 0)
      );
    }, 0);

    if (playerOneTotal === playerTwoTotal) {
      throw new myError("Тоглолт тэнцсэн байна.", 400);
    }

    const winner =
      playerOneTotal > playerTwoTotal ? match.playerOne : match.playerTwo;

    await models.match.updateOne(
      { _id: matchId },
      { $set: { winner, matchDateTime: now, refereeCount: match.refereeCount } }
    );

    // logic to move winner to the next round
    const nextRoundMatchNumber = Math.ceil(match.matchNumber / 2);
    const nextRound = match.round + 1;

    const nextRoundMatch = await models.match.findOne({
      competitionId: match.competitionId,
      categoryId: match.categoryId,
      round: nextRound,
      matchNumber: nextRoundMatchNumber,
    });

    if (nextRoundMatch) {
      if (match.matchNumber % 2 === 1) {
        // winner goes to playerOne
        await models.match.updateOne(
          {
            _id: nextRoundMatch._id,
          },
          { $set: { playerOne: winner } }
        );
      } else {
        // winner goes to playerTwo
        await models.match.updateOne(
          {
            _id: nextRoundMatch._id,
          },
          { $set: { playerTwo: winner } }
        );
      }
    }

    const theParticipant = await models.participant
      .findOne({
        _id: winner,
        competitionId: match.competitionId,
      })
      .lean();

    // ranking section
    if (match.competitionId.rankAffect) {
      await trackScoreUpdate(match, theParticipant.userId);
    }
  }
  // if count < 3 then just increment refereeCount
  if (count < 3) {
    await models.match.updateOne(
      { _id: matchId },
      {
        $set: { refereeCount: match.refereeCount },
      }
    );
  }

  const isCompetitionOver = await models.match
    .findOne({
      competitionId: match.competitionId._id,
      winner: { $exists: false },
    })
    .lean();
  if (!isCompetitionOver) {
    await models.competition.updateOne(
      { _id: match.competitionId },
      {
        $set: {
          endDate: moment()
            .tz("Asia/Ulaanbaatar")
            .format("YYYY-MM-DD HH:mm:ss"),
          isOver: true,
        },
      }
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.updateMatch = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Fight']
  #swagger.summary = 'Update Match'
  #swagger.description = 'Update Match'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Update Match data',
    required: true,
    schema: {
      matchId: '60f4f2c4a4c6b80015f6f5a9',
      round: 1,
      playerOne: {
        _id: '60f4f2c4a4c6b80015f6f5a9',
        score: "10 or K.O",
      },
      playerTwo: {
        _id: '60f4f2c4a4c6b80015f6f5a9',
        score: "9 or 0",
      }, 
      description: ['description', 'description', 'description'],
    }
  }
  */

  const { matchId, round, playerOne, playerTwo, description } = req.body;

  const token = jwt.decode(req.headers.authorization.split(" ")[1]);
  if (token.role !== "referee") {
    throw new myError("Зөвхөн шүүгч оноо өгнө.", 400);
  }

  const roundNumber = parseInt(round);
  if (![1, 2, 3, 4].includes(roundNumber)) {
    throw new myError("Round тодорхойгүй.", 400);
  }

  const participantIds = [playerOne._id, playerTwo._id];

  const [match, participants] = await Promise.all([
    models.match
      .findById({ _id: matchId })
      .populate("competitionId", "referees rankAffect")
      .lean(),
    models.participant.find({ _id: { $in: participantIds } }).lean(),
  ]);
  if (!match) {
    throw new myError("Тоглолт олдсонгүй.", 400);
  }
  if (!match.winner) {
    throw new myError("Тоглолт дууссан байх хэрэгтэй.", 400);
  }

  const roundCheck = await models.match
    .findOne({
      competitionId: match.competitionId._id,
      categoryId: match.categoryId,
      $or: [
        { playerOne: { $in: participantIds.map((p) => p) } },
        { playerTwo: { $in: participantIds.map((p) => p) } },
      ],
      round: { $gt: match.round },
      score: { $exists: true },
    })
    .lean();

  if (roundCheck) {
    throw new myError("Дараагийн роунд эхлэсэн тул засах боломжгүй.", 400);
  }
  if (participants.length !== 2) {
    throw new myError("Тоглогч олдсонгүй.", 400);
  }
  const referees = match.competitionId.referees?.map((ref) => ref.toString());
  if (!referees.includes(token._id.toString())) {
    throw new myError("Тэмцээнд харьяалагдаагүй шүүгч байна.", 400);
  }
  if (
    ![match.playerOne.toString(), match.playerTwo.toString()].includes(
      playerOne._id
    ) ||
    ![match.playerOne.toString(), match.playerTwo.toString()].includes(
      playerTwo._id
    )
  ) {
    throw new myError("Аль нэг тоглогч энэ тоглолтонд хамаараагүй байна.", 400);
  }
  if (playerOne.score === "K.O" && playerTwo.score === "K.O") {
    throw new myError("K.O хоёр тоглогч байх боломжгүй.", 400);
  }

  const newScores = {};
  if (playerOne.score === "K.O" || playerTwo.score === "K.O") {
    const winner = playerOne.score === "K.O" ? playerOne._id : playerTwo._id;
    const scoringPlayer = playerOne.score === "K.O" ? playerOne : playerTwo;
    const loserPlayer = playerOne.score === "K.O" ? playerTwo : playerOne;

    newScores[`score.${scoringPlayer._id}.round${roundNumber}.${token._id}`] = {
      score: "K.O",
      description,
    };
    newScores[`score.${loserPlayer._id}.round${roundNumber}.${token._id}`] = {
      score: "0",
      description: [],
    };

    const updateData = {
      ...newScores,
      winner: winner,
    };

    const updated = await models.match.findOneAndUpdate(
      { _id: matchId },
      { $set: updateData },
      { new: true }
    );

    if (match.winner.toString() != winner) {
      if (match.competitionId.rankAffect) {
        const rankLog = await models.rankingActivity
          .findOne({
            competitionId: match.competitionId._id,
            categoryId: match.categoryId,
            matchId: match._id,
            score: 1,
          })
          .lean();

        if (rankLog) {
          await models.ranking.findOneAndUpdate(
            { userId: rankLog.userId },
            { $inc: { updatedScore: -1 } }
          );

          await models.rankingActivity.deleteOne({ _id: rankLog._id });
        }

        const theParticipant = await models.participant
          .findOne({
            _id: winner,
            competitionId: match.competitionId,
          })
          .lean();

        await trackScoreUpdate(updated, theParticipant.userId);
      }
    }

    return res.status(200).json({
      success: true,
    });
  }

  newScores[`score.${playerOne._id}.round${roundNumber}.${token._id}`] = {
    score: playerOne.score,
    description,
  };
  newScores[`score.${playerTwo._id}.round${roundNumber}.${token._id}`] = {
    score: playerTwo.score,
    description,
  };

  const updated = await models.match.findOneAndUpdate(
    { _id: matchId },
    { $set: newScores },
    { new: true }
  );

  const scores = updated.score;
  const playerOneScores = Object.values(scores[updated.playerOne]);
  const playerTwoScores = Object.values(scores[updated.playerTwo]);

  const playerOneTotal = playerOneScores.reduce((acc, cur) => {
    return (
      acc +
      Object.values(cur).reduce((sum, val) => sum + parseInt(val.score), 0)
    );
  }, 0);
  const playerTwoTotal = playerTwoScores.reduce((acc, cur) => {
    return (
      acc +
      Object.values(cur).reduce((sum, val) => sum + parseInt(val.score), 0)
    );
  }, 0);

  if (playerOneTotal === playerTwoTotal) {
    throw new myError("Тоглолт тэнцсэн байна.", 400);
  }

  const winner =
    playerOneTotal > playerTwoTotal ? match.playerOne : match.playerTwo;

  if (match.winner.toString() != winner.toString()) {
    await models.match.updateOne({ _id: matchId }, { $set: { winner } });

    // ranking section
    if (match.competitionId.rankAffect) {
      const rankLog = await models.rankingActivity
        .findOne({
          competitionId: match.competitionId._id,
          categoryId: match.categoryId,
          matchId: match._id,
          score: 1,
        })
        .lean();

      if (rankLog) {
        await models.ranking.findOneAndUpdate(
          { userId: rankLog.userId },
          { $inc: { updatedScore: -1 } }
        );

        await models.rankingActivity.deleteOne({ _id: rankLog._id });
      }

      const theParticipant = await models.participant
        .findOne({
          _id: winner,
          competitionId: match.competitionId,
        })
        .lean();

      await trackScoreUpdate(updated, theParticipant.userId);
    }
  }

  res.status(200).json({
    success: true,
  });
});
