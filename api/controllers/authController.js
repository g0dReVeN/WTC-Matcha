const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");

const transporter = require('../config/nodemailer');

const UserModel = require('../models/user');

const signToken = require('../middleware/jwtAuth').signToken;

exports.postRegistration = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, msg: errors.errors[0].msg });
  const { username, firstname, lastname, email, password } = req.body;

  try {
    const User = await UserModel;
    let user = await User.findOne({ username });
    if (user)
      return res.status(409).json({ success: false, msg: 'Username already exists' });

    user = await User.findOne({ email });
    if (user)
      return res.status(409).json({ success: false, msg: 'User with this email already exists' });

    const buffer = crypto.randomBytes(32);
    const statusToken = buffer.toString('hex');
    const hashedPassword = await bcrypt.hash(password, 12);
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    await new User({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      tags: ['all'],
      reset_token: statusToken,
      reset_token_expiration: targetDate,
    });
    res.status(201).json({ success: true, msg: "User created" });
    return transporter.sendMail({
      to: email,
      from: 'thepeople@matcha.com',
      subject: 'Signup succeeded!',
      html: `
              <h1>You successfully signed up!</h1>
              <p>Click this <a href="http://localhost:3000/confirm?reset_token=${statusToken}&username=${username}">link</a> to continue.</p>
            `
    });

  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}

// Adding multiple users for testing
exports.postDummyRegistration = (req, res, next) => {
  req.body.forEach(async element => {
    try {
      const { username, firstname, lastname, email, password } = element;

      const User = await UserModel;
      const user = await User.findOne({ username });

      if (!user) {
        const buffer = crypto.randomBytes(32);
        const statusToken = buffer.toString('hex');
        const hashedPassword = await bcrypt.hash(password, 12);
        let targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 5);
        await new User({
          username,
          firstname,
          lastname,
          email,
          password: hashedPassword,
          tags: ['all'],
          reset_token: statusToken,
          reset_token_expiration: targetDate,
          active_status: true,
          fame_rating: Math.floor(Math.random() * 101)
        });
      }
    } catch (e) {
      return res.status(500).json({ success: false, msg: 'Internal server error', e });
    }
  });
  return res.status(200).json({ success: true, msg: 'Users successfully created!' });
}

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, msg: errors.errors[0].msg });
  const { username, password } = req.body;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(400).json({ success: false, msg: 'User not found' });
    if (!user.active_status)
      return res.status(403).json({ success: false, msg: 'User not active' });
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ success: false, msg: 'Password is invalid' });
    const token = await signToken(user);
    if (!token) {
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    }
    return res.status(200).json({ success: true, msg: "User exists. Token attached", token });

  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}

exports.patchUserConfirmation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, msg: errors.errors[0].msg });
  const { reset_token, username } = req.body;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username, reset_token, reset_token_expiration: { $gt: new Date() } });
    if (!user)
      return res.status(400).json({ success: false, msg: 'Invalid token or username given' });
    await User.update({ active_status: true }, { username: username });
    const token = await signToken(user);
    if (!token)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: "User verified. Token attached", token });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}

exports.patchForgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, msg: errors.errors[0].msg });
  const { username, forgot } = req.body;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ success: false, msg: 'Invalid username' });
    const buffer = crypto.randomBytes(32);
    const statusToken = buffer.toString('hex');
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    await User.update({ reset_token: statusToken, reset_token_expiration: targetDate }, { username: username });
    if (forgot) {
      res.status(200).json({ success: true, msg: 'Change password email has been sent to the user' });
      return transporter.sendMail({
        to: user.email,
        from: 'thepeople@matcha.com',
        subject: 'Request for password change',
        html: `
              <h1>Forgot Password!</h1>
              <p>Click this <a href="http://localhost:3000/changePassword?reset_token=${statusToken}&username=${username}">link</a> to continue.</p>
            `
      });
    }
    return res.status(200).json({ success: true, msg: 'Token attached', reset_token: statusToken });
  } catch (e) {
    return res.status(500).json({ status: false, msg: 'Internal server error', e });
  }
}

exports.patchChangePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, msg: errors.errors[0].msg });
  const { username, password, reset_token } = req.body;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username, reset_token });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'Invalid username and/or token' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.update({ password: hashedPassword }, { username });
    return res.status(200).json({ success: true, msg: 'User successfully changed their password' });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}

exports.postValidateResetToken = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, msg: errors.errors[0].msg });
  const { username, reset_token } = req.body;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username, reset_token, reset_token_expiration: { $gt: new Date() } });
    if (user)
      return res.status(200).json({ success: true, msg: "Reset Token valid" });
    return res.status(400).json({ success: false, msg: "Reset Token invalid" });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}