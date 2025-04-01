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
      .findById(theCompetition.categories[i])
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

    const formattedData = theMatches.reduce((acc, match) => {
      match.playerOne = match.playerOne
        ? {
            _id: match.playerOne._id,
            firstName: match.playerOne.userId.firstName,
            lastName: match.playerOne.userId.lastName,
            imageUrl: match.playerOne.userId.imageUrl ?? "",
          }
        : null;
      match.playerTwo = match.playerTwo
        ? {
            _id: match.playerTwo._id,
            firstName: match.playerTwo.userId.firstName,
            lastName: match.playerTwo.userId.lastName,
            imageUrl: match.playerTwo.userId.imageUrl ?? "",
          }
        : null;

      const round = match.round === maxRound ? "Final" : `Round ${match.round}`;

      let roundObj = acc.find((r) => r.round === round);
      if (!roundObj) {
        roundObj = { round, matches: [] };
        acc.push(roundObj);
      }

      roundObj.matches.push({
        _id: match._id,
        match: match.matchNumber.toString(),
        players: [match.playerOne, match.playerTwo],
        score: match.score ?? "",
        winner: match.winner ?? "",
        matchDateTime: match.matchDateTime ?? "",
      });
      return acc;
    }, []);

    data.push({
      category: theCategory.name,
      data: formattedData,
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
      matchId: '60f4f2c4a4c6b80015f6f5a9',
      
    }
  }
  */

  // @todo

  const { competitionId } = req.body;

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
    .findOne({ competitionId: competitionId })
    .lean();
  if (!matchCheck) {
    throw new myError("Оноолт олдсонгүй", 400);
  }

  res.status(200).json({
    success: true,
  });
});
