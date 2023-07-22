const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc     Register a user
// @route    GET /api/v1/auth/register
// @access   Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
