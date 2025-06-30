const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utility/myError");
const models = require("../models/models");

exports.getParticipantRanking = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Ranking'] 
  #swagger.summary = 'Get participant ranking'
  #swagger.description = 'Get participant ranking'
  #swagger.parameters['typeId'] = { 
    in: 'query',
    description: 'typeId',
    required: true,
    type: 'string'
  }
  #swagger.parameters['sex'] = {
    in: 'query',
    description: 'male or female',
    required: true,
    type: 'string'
  }
  */

  const { typeId, sex } = req.query;

  const theType = await models.type.findOne({ _id: typeId }).lean();
  if (!theType) {
    throw new myError("Төрөл олдсонгүй", 400);
  }

  const categories = await models.category
    .find({ typeId, sex }, { name: 1 })
    .lean();
  if (!categories || categories.length === 0) {
    throw new myError("Ангилал байхгүй байна", 400);
  }

  const categoryIds = categories.map((cat) => cat._id);

  // fetch everything in parallel
  const [allRankings, allParticipants, allMatches, allActivities] =
    await Promise.all([
      models.ranking
        .find(
          { categoryId: { $in: categoryIds } },
          { userId: 1, place: 1, score: 1, move: 1, moveBy: 1, categoryId: 1 }
        )
        .populate({
          path: "userId",
          select: "firstName lastName imageUrl club",
          populate: {
            path: "club",
            select: "name logo",
          },
        })
        .sort({ place: 1 })
        .lean(),
      models.participant.find({ categoryId: { $in: categoryIds } }).lean(),
      models.match
        .find({
          categoryId: { $in: categoryIds },
          winner: { $exists: true },
        })
        .lean(),
      models.rankingActivity
        .find({
          categoryId: { $in: categoryIds },
          score: { $in: [2, 5, 10] },
        })
        .lean(),
    ]);

  const data = [];
  for (const category of categories) {
    const topRankings = allRankings
      .filter((r) => r.categoryId.toString() === category._id.toString())
      .slice(0, 5);

    for (const r of topRankings) {
      const userId = r.userId._id.toString();

      // filter user's participants for this category
      const userParticipants = allParticipants.filter(
        (p) =>
          p.userId.toString() === userId &&
          p.categoryId.toString() === category._id.toString()
      );

      let wins = 0,
        losses = 0;

      for (const p of userParticipants) {
        const userMatches = allMatches.filter(
          (m) =>
            ((m.playerOne &&
              p._id &&
              m.playerOne.toString() === p._id.toString()) ||
              (m.playerTwo &&
                p._id &&
                m.playerTwo.toString() === p._id.toString())) &&
            m.categoryId &&
            category._id &&
            m.categoryId.toString() === category._id.toString()
        );

        for (const match of userMatches) {
          if (match.winner.toString() === p._id.toString()) wins++;
          else losses++;
        }
      }

      const medalActivities = allActivities.filter(
        (a) =>
          a.userId.toString() === userId &&
          a.categoryId.toString() === category._id.toString()
      );

      r.wins = wins;
      r.losses = losses;
      r.goldenMedal = medalActivities.filter((a) => a.score === 10).length;
      r.silverMedal = medalActivities.filter((a) => a.score === 5).length;
      r.bronzeMedal = medalActivities.filter((a) => a.score === 2).length;
    }

    data.push({ [category.name]: topRankings });
  }

  res.status(200).json({
    success: true,
    data: data,
  });
});

exports.getClubRanking = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Ranking']
  #swagger.summary = 'Get club ranking'
  #swagger.description = 'Get club ranking'
  */

  const clubs = await models.club.find({}, { name: 1, logo: 1 }).lean();

  const users = await models.user
    .find({ club: { $in: clubs.map((c) => c._id) } }, { _id: 1, club: 1 })
    .lean();

  const userIds = users.map((u) => u._id);

  const activities = await models.rankingActivity
    .find({ userId: { $in: userIds } }, { userId: 1, score: 1 })
    .lean();

  const clubMap = {};

  // map userId to clubId
  const userClubMap = {};
  for (const u of users) {
    userClubMap[u._id.toString()] = u.club.toString();
  }

  // aggregate scores per club
  for (const activity of activities) {
    const clubId = userClubMap[activity.userId.toString()];
    if (!clubMap[clubId]) {
      clubMap[clubId] = {
        totalScore: 0,
        goldenMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
      };
    }

    const score = activity.score;
    clubMap[clubId].totalScore += score;
    if (score === 10) clubMap[clubId].goldenMedals++;
    else if (score === 5) clubMap[clubId].silverMedals++;
    else if (score === 2) clubMap[clubId].bronzeMedals++;
  }

  const data = clubs.map((club) => {
    const stats = clubMap[club._id.toString()] || {
      totalScore: 0,
      goldenMedals: 0,
      silverMedals: 0,
      bronzeMedals: 0,
    };

    return {
      _id: club._id,
      name: club.name,
      logo: club.logo,
      ...stats,
    };
  });

  // sort ranking
  data.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.goldenMedals !== a.goldenMedals)
      return b.goldenMedals - a.goldenMedals;
    if (b.silverMedals !== a.silverMedals)
      return b.silverMedals - a.silverMedals;
    return b.bronzeMedals - a.bronzeMedals;
  });

  res.status(200).json({
    success: true,
    data: data,
  });
});

exports.getParticipantRankingMore = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Ranking']
  #swagger.summary = 'Get ranking details'
  #swagger.description = 'Get ranking details'
  #swagger.parameters['categoryId'] = {
    in: 'query',
    description: 'category id',
    required: true,
    type: 'string'
  }
  #swagger.parameters['page'] = {
    in: 'query',
    description: 'page',
    required: true,
    type: 'number'
  }
  #swagger.parameters['search'] = {
    in: 'query',
    description: 'search',
    type: 'string'
  }
  */

  const { categoryId, page, search } = req.query;
  const pageNumber = parseInt(page) || 1;
  const PAGE_DATA = 20;

  const skipDataLength = (pageNumber - 1) * PAGE_DATA;

  const theCategory = await models.category.findById(categoryId).lean();

  if (!theCategory) {
    throw new myError("Ангилал олдсонгүй.", 400);
  }

  const allRankings = await models.ranking.countDocuments({
    categoryId: theCategory._id,
  });

  let rankings = await models.ranking
    .find(
      { categoryId: theCategory._id },
      { userId: 1, place: 1, score: 1, move: 1, moveBy: 1, categoryId: 1 }
    )
    .populate({
      path: "userId",
      select: "firstName lastName imageUrl club",
      populate: {
        path: "club",
        select: "name logo",
      },
    })
    .sort({ place: 1 })
    .skip(skipDataLength)
    .limit(PAGE_DATA)
    .lean();

  if (search) {
    const regex = new RegExp(search, "i");
    rankings = rankings.filter(
      (r) => regex.test(r.userId?.firstName) || regex.test(r.userId?.lastName)
    );
  }

  const userIds = rankings.map((r) => r.userId?._id).filter(Boolean);

  const [participants, matches, activities] = await Promise.all([
    models.participant
      .find({
        categoryId: theCategory._id,
        userId: { $in: userIds },
      })
      .lean(),
    models.match
      .find({
        categoryId: theCategory._id,
        winner: { $exists: true },
      })
      .lean(),
    models.rankingActivity
      .find({
        userId: { $in: userIds },
        categoryId: theCategory._id,
        score: { $in: [2, 5, 10] },
      })
      .lean(),
  ]);

  for (const r of rankings) {
    const userId = r.userId?._id?.toString();
    if (!userId) continue;

    const userParticipants = participants.filter(
      (p) => p.userId?.toString() === userId
    );

    let wins = 0,
      losses = 0;
    for (const p of userParticipants) {
      const userMatches = matches.filter(
        (m) =>
          m.categoryId.toString() === theCategory._id.toString() &&
          (m.playerOne?.toString() === p._id.toString() ||
            m.playerTwo?.toString() === p._id.toString())
      );

      for (const match of userMatches) {
        if (match.winner?.toString() === p._id.toString()) wins++;
        else losses++;
      }
    }

    const medalActivities = activities.filter(
      (a) => a.userId.toString() === userId
    );

    r.wins = wins;
    r.losses = losses;
    r.goldenMedal = medalActivities.filter((a) => a.score === 10).length;
    r.silverMedal = medalActivities.filter((a) => a.score === 5).length;
    r.bronzeMedal = medalActivities.filter((a) => a.score === 2).length;
  }

  res.status(200).json({
    success: true,
    data: rankings,
    dataLength: allRankings,
    pageSizes: PAGE_DATA,
    currentPage: pageNumber,
  });
});

exports.getRankingDetails = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Ranking']
  #swagger.summary = 'Get ranking details'
  #swagger.description = 'Get ranking details'
  #swagger.parameters['rankingId'] = {
    in: 'query',
    description: 'Ranking ID',
    required: true,
    type: 'string'
  }
  */

  const { rankingId } = req.query;

  const theRank = await models.ranking
    .findById({ _id: rankingId }, { __v: 0, createdAt: 0, updatedScore: 0 })
    .populate({
      path: "userId",
      select: "-__v -createdAt -password -role -registrationNumber -password",
      populate: {
        path: "club",
        select: "name logo",
      },
    })
    .lean();

  if (!theRank) {
    throw new myError("Дэлгэрэнгүй мэдээлэл олдсонгүй.", 400);
  }

  const [rankingActivities, participant] = await Promise.all([
    models.rankingActivity
      .find({ userId: theRank.userId._id })
      .sort({ _id: -1 })
      .lean(),
    models.participant
      .find({ userId: theRank.userId._id }, { __v: 0, createdAt: 0 })
      .populate("categoryId", "name")
      .sort({ _id: -1 })
      .lean(),
  ]);

  const data = [];
  let goldenMedals = 0;
  let silverMedals = 0;
  let bronzeMedals = 0;
  let losses = 0;
  let wins = 0;
  let ko = 0;
  for (const activity of rankingActivities) {
    // if it's in activity log, count as win
    wins++;

    if (activity.score === 10) goldenMedals++;
    else if (activity.score === 5) silverMedals++;
    else if (activity.score === 2) bronzeMedals++;
  }
  for (const part of participant) {
    const matches = await models.match
      .find({
        $and: [
          {
            $or: [{ playerOne: part._id }, { playerTwo: part._id }],
          },
          { playerOne: { $exists: true } },
          { playerTwo: { $exists: true } },
        ],
      })
      .populate("competitionId", "name")
      .populate("playerOne", "userId")
      .populate("playerTwo", "userId")
      .sort({ _id: -1 })
      .lean();

    for (const match of matches) {
      if (match.playerOne && match.playerTwo) {
        const isLoser =
          match.winner && match.winner.toString() !== part._id.toString();

        if (isLoser) losses++;

        // K.O. count
        if (match.score?.[part._id]) {
          for (const round of Object.values(match.score[part._id])) {
            for (const entry of Object.values(round)) {
              if (entry?.score === "K.O.") ko++;
            }
          }
        }

        // find competitor from user model
        const isPlayerOneMe =
          match.playerOne._id?.toString() === part._id.toString();
        const opponent = isPlayerOneMe ? match.playerTwo : match.playerOne;
        let opponentUser = null;

        if (opponent?.userId) {
          opponentUser = await models.user
            .findById(opponent.userId, "firstName lastName imageUrl")
            .lean();
        }

        // store match detail per participant
        data.push({
          matchId: match._id,
          date: match.matchDateTime,
          isWin: !isLoser,
          isKO: ko > 0,
          competition: match.competitionId?.name ?? "Тодорхойгүй",
          category: part.categoryId?.name,
          opponent: opponentUser,
        });
      }
    }
  }

  theRank.userId.score = theRank.score;
  theRank.userId.goldenMedals = goldenMedals;
  theRank.userId.silverMedals = silverMedals;
  theRank.userId.bronzeMedals = bronzeMedals;
  theRank.userId.wins = wins;
  theRank.userId.losses = losses;
  theRank.userId.ko = ko;

  res.status(200).json({
    success: true,
    data: {
      user: theRank.userId,
      matches: data,
    },
  });
});

exports.getClubDetails = asyncHandler(async (req, res, next) => {
  /*
  #swagger.tags = ['Ranking']
  #swagger.summary = 'Get club ranking details'
  #swagger.description = 'Get club ranking details'
  #swagger.parameters['clubId'] = {
    in: 'query',
    description: 'Club ID',
    required: true,
    type: 'string'
  }
  */

  const { clubId } = req.query;

  const theClub = await models.club
    .findById({ _id: clubId }, { createdBy: 0, createdAt: 0, __v: 0, coach: 0 })
    .lean();

  if (!theClub) {
    throw new myError("Клуб олдсонгүй.", 400);
  }

  const members = await models.user.find({ club: theClub._id }).lean();
  const userIds = members.map((u) => u._id);

  const participants = await models.participant
    .find({ userId: { $in: userIds }, status: "approved" })
    .populate("competitionId", "name")
    .lean();

  let totalScore = 0;
  let totalGolden = 0;
  let totalSilver = 0;
  let totalBronze = 0;

  const compMap = {};
  for (const part of participants) {
    const comp = part.competitionId;
    if (!comp) continue;

    // init if new competition
    if (!compMap[comp._id.toString()]) {
      compMap[comp._id.toString()] = {
        name: comp.name,
        participantCount: 0,
        totalScore: 0,
        medals: {
          golden: 0,
          silver: 0,
          bronze: 0,
        },
      };
    }

    // count this participant
    compMap[comp._id.toString()].participantCount++;

    // get scores from rankingActivity
    const activities = await models.rankingActivity
      .find({ userId: part.userId })
      .lean();

    for (const act of activities) {
      compMap[comp._id.toString()].totalScore += act.score;
      totalScore += act.score;

      // count medals
      if (act.score === 10) {
        compMap[comp._id.toString()].medals.golden++;
        totalGolden++;
      } else if (act.score === 5) {
        compMap[comp._id.toString()].medals.silver++;
        totalSilver++;
      } else if (act.score === 2) {
        compMap[comp._id.toString()].medals.bronze++;
        totalBronze++;
      }
    }
  }

  const competitions = Object.values(compMap);

  res.status(200).json({
    success: true,
    data: {
      club: theClub,
      totalScore,
      medals: {
        golden: totalGolden,
        silver: totalSilver,
        bronze: totalBronze,
      },
      competitions,
    },
  });
});
