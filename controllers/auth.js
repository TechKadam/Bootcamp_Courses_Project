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
      // this is a statics because it is called on model itself
      name,
      email,
      password,
      role,
    });
    // Create token
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
