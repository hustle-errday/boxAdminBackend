const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const { generateBracketData } = require("../myFunctions/matchingHelper");

exports.matching = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Match'] 
  #swagger.summary = 'Matching'
  #swagger.description = 'Matching'
  #swagger.parameters['body'] = { 
    in: 'body',
    description: 'Matching data',
    required: true,
    schema: {
      competitionId: '60f4f2c4a4c6b80015f6f5a9' 
    }
  }
  */

  const { competitionId } = req.body;

  // await models.match.deleteMany({});
  // await models.participant.updateMany(
  //   { competitionId: competitionId },
  //   { $set: { status: "approved", chargePaid: true } }
  // );

  const now = moment().tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");

  const competition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!competition) {
    throw new myError("Тэмцээн олдсонгүй.", 400);
  }
  if (moment(competition.startDate).isBefore(now)) {
    throw new myError("Тэмцээн эхлэсэн байна.", 400);
  }

  const matchCheck = await models.match.findOne({
    competitionId: competitionId,
  });
  if (matchCheck) {
    throw new myError("Тэмцээний оноолтыг гаргасан байна.", 400);
  }

  const participants = await models.participant
    .find({
      competitionId: competitionId,
      status: "approved",
      chargePaid: true,
    })
    .lean();

  if (participants.length < 2) {
    throw new myError("Тэмцээнд оролцогчид хэтэрхий цөөн байна.", 400);
  }

  const matches = [];

  // group participants by category
  const participantsByCategory = {};
  participants.forEach((participant) => {
    if (!participantsByCategory[participant.categoryId]) {
      participantsByCategory[participant.categoryId] = [];
    }
    participantsByCategory[participant.categoryId].push(participant);
  });

  for (let i = 0; i < Object.keys(participantsByCategory).length; i++) {
    const categoryId = Object.keys(participantsByCategory)[i];
    let participantIds = participantsByCategory[categoryId].map(
      (participant) => participant._id
    );

    // calculate the next power of 2
    const nextPowerOf2Value = Math.pow(
      2,
      Math.ceil(Math.log2(participantIds.length))
    );
    // calculate the number of rounds
    const numRounds = Math.ceil(Math.log2(nextPowerOf2Value));
    // calculate the number of byes
    const byes = nextPowerOf2Value - participantIds.length;

    // shuffle participants
    for (let i = participantIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participantIds[i], participantIds[j]] = [
        participantIds[j],
        participantIds[i],
      ];
    }

    // create matches for each round
    for (let round = 1; round <= numRounds; round++) {
      // reset counter for each round
      let matchNumberCounter = 1;

      if (round === 1) {
        // round 1
        const matchPlayers = participantIds.slice(
          0,
          participantIds.length - byes
        );
        for (let i = 0; i < matchPlayers.length / 2; i++) {
          const playerOne = matchPlayers[i * 2];
          const playerTwo = matchPlayers[i * 2 + 1];

          const match = await models.match.create({
            competitionId: competitionId,
            categoryId: categoryId,
            playerOne: playerOne,
            playerTwo: playerTwo,
            round: round,
            matchNumber: matchNumberCounter++,
          });

          matches.push(match);
        }

        // handle byes
        const byePlayers = participantIds.slice(participantIds.length - byes);
        byePlayers.forEach(async (byePlayer) => {
          const byeMatch = await models.match.create({
            competitionId: competitionId,
            categoryId: categoryId,
            playerOne: byePlayer,
            playerTwo: null,
            round: round,
            matchNumber: matchNumberCounter++,
          });

          matches.push(byeMatch);
        });
      } else {
        // subsequent rounds
        const numMatchesInRound = nextPowerOf2Value / Math.pow(2, round);
        for (let i = 0; i < numMatchesInRound; i++) {
          const match = await models.match.create({
            competitionId: competitionId,
            categoryId: categoryId,
            playerOne: null,
            playerTwo: null,
            round: round,
            matchNumber: matchNumberCounter++,
          });

          matches.push(match);
        }
      }
    }
  }

  // generate bracket data
  const categoryIdValue = competition.categories[0]; // assuming one category for simplicity
  const bracketData = await generateBracketData(competitionId, categoryIdValue);

  res.status(200).json({
    success: true,
    data: bracketData,
  });
});

exports.getMatches = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Match']
  #swagger.summary = 'Get Matches'
  #swagger.description = 'Get Matches'
  #swagger.parameters['competitionId'] = { competitionId: "aaanhn" }
  */

  const { competitionId } = req.query;

  const theCompetition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!theCompetition) {
    throw new myError("Тэмцээн олдсонгүй", 400);
  }

  const data = [];

  for (let i = 0; i < theCompetition.categories.length; i++) {
    const theCategory = await models.category
      .findById({ _id: theCompetition.categories[i] }, { name: 1 })
      .lean();

    if (!theCategory) {
      throw new myError("Ангилал олдсонгүй", 400);
    }

    const theMatches = await models.match
      .find({ competitionId, categoryId: theCategory._id })
      .populate("categoryId", "name")
      .populate({
        path: "playerOne",
        populate: {
          path: "userId",
          model: "user",
        },
      })
      .populate({
        path: "playerTwo",
        populate: {
          path: "userId",
          model: "user",
        },
      })
      .sort({ round: 1, matchNumber: 1 })
      .lean();

    const maxRound = Math.max(...theMatches.map((match) => match.round));

    const formattedData = await Promise.all(
      theMatches.map(async (match) => {
        const round =
          match.round === maxRound ? "Final" : `Round ${match.round}`;

        let playerOneClub = null;
        let playerTwoClub = null;

        if (match.playerOne?.userId?.club) {
          const theClub = await models.club
            .findById({ _id: match.playerOne.userId.club })
            .lean();
          playerOneClub = theClub
            ? { _id: theClub._id, name: theClub.name, logo: theClub.logo ?? "" }
            : null;
        }
        if (match.playerTwo?.userId?.club) {
          const theClub = await models.club
            .findById({ _id: match.playerTwo.userId.club })
            .lean();
          playerTwoClub = theClub
            ? { _id: theClub._id, name: theClub.name, logo: theClub.logo ?? "" }
            : null;
        }

        const playerOne = match.playerOne
          ? {
              _id: match.playerOne._id,
              firstName: match.playerOne.userId.firstName,
              lastName: match.playerOne.userId.lastName,
              imageUrl: match.playerOne.userId.imageUrl ?? "",
              club: playerOneClub,
            }
          : null;
        const playerTwo = match.playerTwo
          ? {
              _id: match.playerTwo._id,
              firstName: match.playerTwo.userId.firstName,
              lastName: match.playerTwo.userId.lastName,
              imageUrl: match.playerTwo.userId.imageUrl ?? "",
              club: playerTwoClub,
            }
          : null;

        if (match.score) {
          for (const key of Object.keys(match.score)) {
            if (key.toString() === match.playerOne?._id?.toString()) {
              match.score.playerOne = match.score[key];
              delete match.score[key];
            }
            if (key.toString() === match.playerTwo?._id?.toString()) {
              match.score.playerTwo = match.score[key];
              delete match.score[key];
            }
          }
        }

        return {
          round,
          match: {
            _id: match._id,
            match: match.matchNumber.toString(),
            players: [playerOne, playerTwo],
            score: match.score ?? "",
            winner: match.winner ?? "",
            matchDateTime: match.matchDateTime ?? "",
          },
        };
      })
    );

    const reduced = formattedData.reduce((acc, item) => {
      let roundObj = acc.find((r) => r.round === item.round);
      if (!roundObj) {
        roundObj = { round: item.round, matches: [] };
        acc.push(roundObj);
      }
      roundObj.matches.push(item.match);
      return acc;
    }, []);

    data.push({
      category: { _id: theCategory._id, name: theCategory.name },
      data: reduced,
    });
  }

  res.status(200).json({
    success: true,
    data: data,
  });
});

exports.updateMatch = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Match']
  #swagger.summary = 'Update Match'
  #swagger.description = 'Update Match'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Match data',
    required: true,
    schema: {
      competitionId: '60f4f2c4a4c6b80015f6f5a9',
      categoryId: '60f4f2c4a4c6b80015f6f5a9',
      matches: [
        {
          _id: '60f4f2c4a4c6b80015f6f5a9',
          match: 1,
          playerOne: '60f4f2c4a4c6b80015f6f5a9',
          playerTwo: '60f4f2c4a4c6b80015f6f5a9'
        },
        {
          _id: '60f4f2c4a4c6b80015f6f5a9',
          match: 2,
          playerOne: '60f4f2c4a4c6b80015f6f5a9',
          playerTwo: '60f4f2c4a4c6b80015f6f5a9'
        },
      ]
    }
  }
  */

  const { competitionId, categoryId, matches } = req.body;

  const now = moment.tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm:ss");

  const theCompetition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!theCompetition) {
    throw new myError("Тэмцээн олдсонгүй", 400);
  }
  if (moment(theCompetition.startDate).isBefore(now)) {
    throw new myError("Тэмцээн эхлэсэн байна.", 400);
  }

  const matchCheck = await models.match
    .findOne({ competitionId: competitionId, categoryId: categoryId })
    .lean();
  if (!matchCheck) {
    throw new myError("Оноолт олдсонгүй", 400);
  }

  for (let i = 0; i < matches.length; i++) {
    if (!matches[i].playerOne && !matches[i].playerTwo) {
      continue;
    }
    if (matches[i].playerOne && matches[i].playerTwo) {
      const theParticipants = await models.participant
        .find({
          _id: { $in: [matches[i].playerOne, matches[i].playerTwo] },
        })
        .lean();

      if (theParticipants.length !== 2) {
        throw new myError("Оролцогч олдсонгүй", 400);
      }
    }
    if (!matches[i].playerOne && matches[i].playerTwo) {
      const theParticipants = await models.participant
        .findOne({ _id: matches[i].playerTwo })
        .lean();

      if (!theParticipants) {
        throw new myError("Оролцогч олдсонгүй", 400);
      }
    }
    if (matches[i].playerOne && !matches[i].playerTwo) {
      const theParticipants = await models.participant
        .findOne({ _id: matches[i].playerOne })
        .lean();

      if (!theParticipants) {
        throw new myError("Оролцогч олдсонгүй", 400);
      }
    }

    const update = await models.match.updateOne(
      { _id: matches[i]._id, matchNumber: matches[i].match },
      {
        playerOne: matches[i].playerOne,
        playerTwo: matches[i].playerTwo,
      },
      { new: true }
    );
    if (!update) {
      throw new myError("Оноолт олдсонгүй", 400);
    }
  }

  res.status(200).json({
    success: true,
    data: "Оноолт амжилттай шинэчлэгдлээ.",
  });
});

exports.getMatchInfo = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Match']
  #swagger.summary = 'Get Match Info'
  #swagger.description = 'Get match info by competitionId and matchId'
  #swagger.parameters['competitionId'] = { competitionId: '60f4f2c4a4c6b80015f6f5a9' }
  #swagger.parameters['matchId'] = { matchId: '60f4f2c4a4c6b80015f6f5a9' }
  */

  const { competitionId, matchId } = req.query;

  const theCompetition = await models.competition
    .findById({ _id: competitionId })
    .lean();
  if (!theCompetition) {
    throw new myError("Тэмцээн олдсонгүй", 400);
  }

  const theMatch = await models.match
    .findById({ _id: matchId })
    .populate("categoryId", "name")
    .populate({
      path: "playerOne",
      populate: {
        path: "userId",
        model: "user",
      },
    })
    .populate({
      path: "playerTwo",
      populate: {
        path: "userId",
        model: "user",
      },
    })
    .lean();
  if (!theMatch) {
    throw new myError("Оноолт олдсонгүй", 400);
  }

  const maxRound = Math.max(theMatch.round);

  const round =
    theMatch.round === maxRound ? "Final" : `Round ${theMatch.round}`;

  let playerOneClub = null;
  let playerTwoClub = null;

  if (theMatch.playerOne?.userId?.club) {
    const theClub = await models.club
      .findById({ _id: theMatch.playerOne.userId.club })
      .lean();
    playerOneClub = theClub
      ? { _id: theClub._id, name: theClub.name, logo: theClub.logo ?? "" }
      : null;
  }
  if (theMatch.playerTwo?.userId?.club) {
    const theClub = await models.club
      .findById({ _id: theMatch.playerTwo.userId.club })
      .lean();
    playerTwoClub = theClub
      ? { _id: theClub._id, name: theClub.name, logo: theClub.logo ?? "" }
      : null;
  }

  const playerOne = theMatch.playerOne
    ? {
        _id: theMatch.playerOne._id,
        firstName: theMatch.playerOne.userId.firstName,
        lastName: theMatch.playerOne.userId.lastName,
        imageUrl: theMatch.playerOne.userId.imageUrl ?? "",
        club: playerOneClub,
      }
    : null;
  const playerTwo = theMatch.playerTwo
    ? {
        _id: theMatch.playerTwo._id,
        firstName: theMatch.playerTwo.userId.firstName,
        lastName: theMatch.playerTwo.userId.lastName,
        imageUrl: theMatch.playerTwo.userId.imageUrl ?? "",
        club: playerTwoClub,
      }
    : null;

  if (theMatch.score) {
    for (const key of Object.keys(theMatch.score)) {
      if (key.toString() === theMatch.playerOne?._id?.toString()) {
        theMatch.score.playerOne = theMatch.score[key];
        delete theMatch.score[key];
      }
      if (key.toString() === theMatch.playerTwo?._id?.toString()) {
        theMatch.score.playerTwo = theMatch.score[key];
        delete theMatch.score[key];
      }
    }
  }

  const data = {
    category: { _id: theMatch.categoryId._id, name: theMatch.categoryId.name },
    round,
    match: {
      _id: theMatch._id,
      match: theMatch.matchNumber.toString(),
      players: [playerOne, playerTwo],
      score: theMatch.score ?? "",
      winner: theMatch.winner ?? "",
      matchDateTime: theMatch.matchDateTime ?? "",
    },
  };

  res.status(200).json({
    success: true,
    data: data,
  });
});
