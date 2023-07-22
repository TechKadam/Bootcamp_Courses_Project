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

// @desc     Login a user
// @route    GET /api/v1/auth/login
// @access   Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validate email & password
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }
    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(
        new ErrorResponse("User with the given email id does not exists", 401)
      );
    }
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Incorrect Password", 401));
    }
    // Create token
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
