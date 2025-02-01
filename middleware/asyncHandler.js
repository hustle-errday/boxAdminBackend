const asyncHandler = (jingo) => (req, res, next) =>
  Promise.resolve(jingo(req, res, next)).catch(next);

module.exports = asyncHandler;
