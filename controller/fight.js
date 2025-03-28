const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");

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
      players: [
        

      ]
      participantId: '60f4f2c4a4c6b80015f6f5a9',
      score: 10,
      description: "Good fight"
    }
  }
  */

  const { matchId, participantId, score, description } = req.body;

  const token = jwt.decode(req.headers.authorization.split(" ")[1]);
  if (token.role !== "referee") {
    throw new myError("Зөвхөн шүүгч оноо өгнө.", 400);
  }

  const [match, participant] = await Promise.all([
    models.match.findById({ _id: matchId }).lean(),
    models.participant.findById({ _id: participantId }).lean(),
  ]);

  if (!match) {
    throw new myError("Тоглолт олдсонгүй.", 400);
  }
  if (!participant) {
    throw new myError("Тоглогч олдсонгүй.", 400);
  }
  if (match.playerOne !== participantId && match.playerTwo !== participantId) {
    throw new myError("Тоглогч тоглолтонд ороогүй байна.", 400);
  }

  await models.match.updateOne(
    { _id: matchId, "scores.participantId": participantId },
    { $set: { "scores.$.score": score } }
  );

  res.status(200).json({
    success: true,
    message: "Score given",
  });
});
