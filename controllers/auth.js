const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc     Register a user
// @route    GET /api/v1/auth/register
// @access   Public
exports.register = async (req, res, next) => {
  res.status(200).json({ success: true });
};
