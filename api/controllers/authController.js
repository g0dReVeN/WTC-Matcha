const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");
const path = require('path');
const fs = require('fs');

const transporter = require('../config/nodemailer');
const crude = require('../config/db');

const UserModel = require('../models/user');
const TagsModel = require('../models/tags');
const { start } = require('repl');

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
    console.log(e);
    return res.status(500).json({ success: false, msg: 'Internal server error' });
  }
}

// Adding multiple users for testing
exports.postDummyRegistration = (req, res, next) => {
  const filePath = path.join(__dirname, '../', 'MOCK_DATA.json');
  const rawdata = fs.readFileSync(filePath);
  const dummyUsers = JSON.parse(rawdata);
  // console.log(dummyUsers)
  const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
  const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  try {
    const start = async () => {
      await asyncForEach(dummyUsers, async (elem, index) => {
        const {
          username,
          firstname,
          lastname,
          email,
          password,
          tags,
          age,
          latitude,
          longitude,
          fame_rating,
          gender,
          sexual_preference,
          biography
        } = elem;

        const User = await UserModel;
        const user = await User.findOne({ username });

        if (tags && tags.length) {
          const Tags = await TagsModel;
          const resultTags = await Tags.findById(1);
          if (!resultTags) {
            await new Tags({
              tag_list: tags
            });
          } else {
            const tag_list = [...new Set([...resultTags.tag_list, ...tags])];
            await Tags.update({ tag_list }, { id: 1 });
          }
        }
        if (!user) {
          const buffer = crypto.randomBytes(32);
          const statusToken = buffer.toString('hex');
          let targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + 5);
          const location = {
            lat: latitude,
            long: longitude
          }
          const imageList = [];
          const numOfFiles = Math.floor((Math.random() * 5) + 1);
          req.files.forEach((image, index) => {
            if (index < numOfFiles)
              imageList.push(image.filename);
          });
          await User.update({ images: imageList }, { id: index });
          const hashedPassword = await bcrypt.hash(password, 12);
          await new User({
            username,
            firstname,
            lastname,
            email,
            password: hashedPassword,
            tags,
            age,
            location,
            fame_rating,
            gender,
            sexual_preference,
            biography,
            images: imageList,
            completed_profile: true,
            last_connection: new Date(),
            reset_token: statusToken,
            reset_token_expiration: targetDate,
            active_status: true
          });
        }
        // const tags = elem.tags;
        // // await waitFor(20);
        // const Tags = await TagsModel;
        // const resultTags = await Tags.findById(1);
        // const tag_list = [...new Set([...resultTags.tag_list, ...tags])];
        // await Tags.update({ tag_list }, { id: 1 });
      });
      console.log('Done');
    }
    start();
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
  return res.status(200).json({ success: true, msg: 'Dummy users successfully created!' });
}

exports.postDummyImages = async (req, res, next) => {
  const asyncForEach = async (callback) => {
    for (let index = 1; index <= 500; index++) {
      await callback(index);
    }
  }
  try {
    const start = async () => {
      await asyncForEach(async (index) => {
        const User = await UserModel;
        const user = await User.findById(index);
        if (user) {
          const imageList = [];
          const numOfFiles = Math.floor((Math.random() * 5) + 1);
          req.files.forEach((image, index) => {
            if (index < numOfFiles)
              imageList.push(image.filename);
          });
          await User.update({ images: imageList }, { id: index });
        }
      });
      console.log("Done");
    }
    start();
  } catch (e) {
    console.log(e);
  }
  return res.status(200).json({ success: true, msg: 'Dummy images successfully created!' });

  // const user_id = req.body.user_id;
  // try {
  //   const User = await UserModel;
  //   const user = await User.findById(user_id);
  //   if (user) {
  //     const imageList = [];
  //     const numOfFiles = Math.floor((Math.random() * 5) + 1);
  //     req.files.forEach((image, index) => {
  //       if (index < numOfFiles)
  //         imageList.push(image.filename);
  //     });
  //     await User.update({ images: imageList }, { id: user_id });
  //     return res.status(200).json({ success: true, msg: 'Dummy users successfully updated with images!' });
  //   }
  //   return res.status(404).json({ success: true, msg: 'User not found' });
  // } catch (e) {
  //   return res.status(500).json({ success: false, msg: 'Internal server error', e });
  // }
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
    await User.update({ active_status: true }, { username });
    const token = await signToken(user);
    if (!token)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: "User verified. Token attached", token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, msg: 'Internal server error' });
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
      return res.status(404).json({ success: false, msg: 'User not found' });
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
    const user = await User.findOne({ username, reset_token, reset_token_expiration: { $gt: new Date() } });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'Invalid username and/or token, or token has expired' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.update({ password: hashedPassword }, { username });
    return res.status(200).json({ success: true, msg: 'User has successfully changed their password' });
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
    return res.status(400).json({ success: false, msg: "Reset Token invalid or has expired" });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}