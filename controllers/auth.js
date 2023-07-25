const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
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
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc     Get current logged in user
// @route    GET /api/v1/auth/me
// @access   Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc     Forgot password
// @route    GET /api/v1/auth/forgotpassword
// @access   Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset URL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetPassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to:\n\n${resetURL}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });
      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Email could not be sent", 500));
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc     Reset Password
// @route    PUT /api/v1/auth/resetpassword/:resettoken
// @access   Public
exports.resetPassword = async (req, res, next) => {
  try {
    // get hashed token
    console.log(req.params.resetToken);
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
