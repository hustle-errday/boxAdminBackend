const models = require("../models/models");

// function to calculate the next power of 2
const nextPowerOf2 = (num) => {
  return Math.pow(2, Math.ceil(Math.log2(num)));
};

// function to generate the bracket data structure
const generateBracketData = async (competitionId, categoryId) => {
  const matches = await models.match
    .find({
      competitionId: competitionId,
      categoryId: categoryId,
    })
    .lean();

  const participants = await models.participant
    .find({
      competitionId: competitionId,
      categoryId: categoryId,
      status: "approved",
    })
    .populate("userId")
    .lean();

  const numParticipants = participants.length;
  const numRounds = Math.ceil(Math.log2(nextPowerOf2(numParticipants)));
  const bracketData = { rounds: [] };

  // organize matches by round
  const matchesByRound = {};
  matches.forEach((match) => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push(match);
  });

  // create bracket structure
  for (let round = 1; round <= numRounds; round++) {
    const roundMatches = [];
    const currentRoundMatches = matchesByRound[round] || [];

    // console.log(`Round ${round} matches:`, currentRoundMatches);

    if (round === 1) {
      // round 1: include players and byes
      let roundParticipants = participants.map((participant) => ({
        userId: participant.userId._id,
        name: participant.userId.name, // assuming 'name' is a field in the user model
      }));

      const nextPower = nextPowerOf2(roundParticipants.length);
      const byes = nextPower - roundParticipants.length;

      // ensure we have enough bye "slots"
      for (let i = 0; i < nextPower; i++) {
        let match;
        if (i < currentRoundMatches.length) {
          match = currentRoundMatches[i];
        } else {
          match = {
            player1: null,
            player2: null,
            winner: null,
            _id: null,
          };
        }

        let player1 = null;
        let player2 = null;

        if (match) {
          if (match.playerOne) {
            player1 = roundParticipants.find((p) =>
              p.userId.equals(match.playerOne)
            );
          }
          if (match.playerTwo) {
            player2 = roundParticipants.find((p) =>
              p.userId.equals(match.playerTwo)
            );
          }
        }

        roundMatches.push({
          player1: player1,
          player2: player2,
          winner: match ? match.winner : null,
          matchId: match ? match._id : null,
        });
      }
    } else {
      // subsequent rounds: placeholder for winners
      const prevRoundMatches = bracketData.rounds[round - 2].matches;

      let roundMatchesCounter = 0;
      for (let i = 0; i < prevRoundMatches.length; i += 2) {
        let match;
        if (currentRoundMatches[roundMatchesCounter]) {
          match = currentRoundMatches[roundMatchesCounter];
        } else {
          match = {
            player1: null,
            player2: null,
            winner: null,
            _id: null,
          };
        }

        let player1 = null;
        let player2 = null;

        if (match) {
          if (match.playerOne) {
            player1 = {
              userId: match.playerOne,
              name: "TBD",
            };
          }
          if (match.playerTwo) {
            player2 = {
              userId: match.playerTwo,
              name: "TBD",
            };
          }
        }

        roundMatches.push({
          player1: player1,
          player2: player2,
          winner: match ? match.winner : null,
          matchId: match ? match._id : null,
        });
        roundMatchesCounter++;
      }
    }

    // filter out matches with null matchId
    const filteredRoundMatches = roundMatches.filter(
      (match) => match.matchId !== null
    );

    bracketData.rounds.push({
      roundNumber: round,
      matches: filteredRoundMatches,
    });
  }

  return bracketData;
};

module.exports = { generateBracketData, nextPowerOf2 };
