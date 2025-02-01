const jwt = require("jsonwebtoken");

exports.authenticateRequest = (req, res, next) => {
  /**
   #swagger.parameters["authorization"]={
    in:"header",
    description:"access token",
    required:true,
    default:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OTcxZGM3MDc3NTg2YmRhMjUyMWMwMiIsInJvbGUiOiJvd25lciIsInVzZXJuYW1lIjoiOTQyODgwMDgiLCJvcmdhbml6YXRpb25JZCI6IjY3OTcxZGM3MDc3NTg2YmRhMjUyMWMwMCIsImlhdCI6MTczNzk3NDg5MCwiZXhwIjoxNzM5MjcwODkwfQ.lQb4MH9jWY2-wzKCDgzWclUWKuipFFQm5E9sLmgY7T8"
   }
   */
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Алдаа гарлаа. Та дахин нэвтрэнэ үү.",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Алдаа гарлаа. Та дахин нэвтрэнэ үү.",
    });
  }
};
