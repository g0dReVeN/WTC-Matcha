const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");
const path = require('path');
const fs = require('fs');

const UserModel = require('../models/user');
const HistoryModel = require('../models/history');
const UserImagesModel = require('../models/images');

const jwtAuth = require('../middleware/jwtAuth');

const refreshToken = async (user) => {
  try {
    const User = await UserModel;
    const last_connection = new Date();
    await User.update({ last_connection }, { username: user.username });
    user.last_connection = last_connection;
    const newToken = await jwtAuth.signToken(user);
    if (!newToken)
      return false;
    return newToken;
  } catch (e) {
    return false;
  }
}

exports.patchEditProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(422).json({ success: false, msg: errors.errors[0].msg, token: refreshedToken });
  }
  const {
    age = req.user.age,
    location = req.user.location,
    gender = req.user.gender,
    sexual_preference = req.user.sexual_preference,
    biography = req.user.biography,
    tags = req.user.tags,
    username = req.user.username,
    firstname = req.user.firstname,
    lastname = req.user.lastname,
    email = req.user.email,
    password = req.user.password
  } = req.body;

  let completed_profile = false;
  let tagList = tags;
  if (!Array.isArray(tags))
    tagList = tags.substring(1, tags.length - 1).replace(/"/g, '').split(",");
  if (age && location && gender && sexual_preference && biography && tags.length && username && firstname && lastname && email && password)
    completed_profile = true;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const User = await UserModel;
    await User.update({ age, gender, location: JSON.stringify(location), sexual_preference, biography, tags: tagList, completed_profile, username, firstname, lastname, email, password: hashedPassword }, { id: req.user.id });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'User profile updated', token: refreshedToken });
  } catch (e) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', e, token: refreshedToken });
  }
}

exports.getFilteredUsers = (req, res, next) => {

  /** Things to do:
   * Gotta include pics into result eventually
   * And include location into query and response
   */

  const age = {
    low: req.body.age.low,
    high: req.body.age.high
  };
  const fame_rating = {
    low: req.body.fame_rating.low,
    high: req.body.fame_rating.high
  };
  const tags = req.body.tags;

  History.findOne({ userId: req.user._id })
    .then(history => {
      let historyList;
      if (!history)
        historyList = [];
      else
        historyList = history.historyList.map(userHistory => userHistory.user);
      User.find({
        age: { $lt: age.high, $gt: age.low },
        fameRating: { $lt: fame_rating.high, $gt: fame_rating.low },
        sexual_preference: req.user.sexual_preference,
        tags: { $in: tags },
        _id: { $not: { $in: historyList } }
      })
        .select(["-password", "-email"])
        .limit(6)
        .then(users => {
          return res.status(200).json({ success: true, msg: 'Found users mathcing filters', users });
        })
        .catch(err => res.status(500).json({ success: false, msg: 'Internal server error', err }));
    })
    .catch(err => res.status(500).json({ success: false, msg: 'Internal server error', err }));
}

exports.putHistory = async (req, res, next) => {
  const { user_id, like } = req.body;
  const id = req.user.id;

  try {
    const History = await HistoryModel;
    const history = await History.findOne({ user_id: req.user.id });
    if (!history) {
      const historyEntry = {};
      historyEntry[user_id] = like;
      await new History({
        user_id: req.user.id,
        history_list: JSON.stringify(historyEntry)
      });
    } else {
      const history_list = history.history_list;
      history_list[user_id] = like;
      await History.update({ history_list: JSON.stringify(history_list) }, { user_id: id });
    }
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'History added', token: refreshedToken });
  } catch (e) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', e, token: refreshedToken });
  }
}

exports.putSingleUserImage = async (req, res, next) => {
  if (!req.files) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(401).json({ success: false, msg: "Error uploading or no image uploaded", token: refreshedToken });
  }
  if (req.files.length != 1) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(401).json({ success: false, msg: "Too many images sent", token: refreshedToken });
  }

  try {
    const id = req.user.id;
    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: id });

    if (!userImages) {
      const imageList = [];
      imageList.push(req.files[0].filename);
      await new UserImages({
        user_id: req.user.id,
        image_list: imageList
      });
    } else {
      const image_list = userImages.image_list;
      const image_list_array = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");
      image_list_array.push(req.files[0].filename);
      await UserImages.update({ image_list: image_list_array }, { user_id: id });
    }
    const User = await UserModel;
    await User.update({ num_of_images: req.user.num_of_images + 1 }, { username: req.user.username });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'Image uploaded', token: refreshedToken });
  } catch (e) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', e, token: refreshedToken });
  }
}

exports.putMultipleUserImages = async (req, res, next) => {
  if (!req.files) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(401).json({ success: false, msg: "Error uploading or no images uploaded", token: refreshedToken });
  }

  try {
    const id = req.user.id;
    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: id });

    let imageList = [];
    if (!userImages) {
      req.files.forEach(image => {
        imageList.push(image.filename);
      });
      await new UserImages({
        user_id: req.user.id,
        image_list: imageList
      });
    } else {
      const image_list = userImages.image_list;
      imageList = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");
      req.files.forEach(image => {
        imageList.push(image.filename);
      });
      await UserImages.update({ image_list: imageList }, { user_id: id });
    }
    const User = await UserModel;
    await User.update({ num_of_images: imageList.length }, { username: req.user.username });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'Image(s) uploaded', token: refreshedToken });
  } catch (e) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', e, token: refreshedToken });
  }
}

exports.deleteUserImage = async (req, res, next) => {
  const img = req.params.img;
  let imageExists = false;

  try {
    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: req.user.id });

    if (!userImages) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(404).json({ success: false, msg: 'This user has no images', token: refreshedToken });
    }

    const image_list = userImages.image_list;
    const image_list_array = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");

    const filtered_image_list_array = image_list_array.filter(image => {
      if (image === img)
        imageExists = true;
      return image != img;
    });

    if (!imageExists) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(400).json({ success: false, msg: 'Image not found', token: refreshedToken });
    }

    await UserImages.update({ image_list: filtered_image_list_array }, { user_id: req.user.id });
    const User = await UserModel;
    await User.update({ num_of_images: req.user.num_of_images - 1 }, { username: req.user.username });

    const filePath = path.join(__dirname, '../imgUploads', img);
    fs.unlinkSync(filePath);

    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'Image successfully deleted', token: refreshedToken });
  } catch (e) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', e, token: refreshedToken });
  }
}

exports.getUserImages = async (req, res, next) => {
  const { username, img } = req.params;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username: username });

    if (!user) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(404).json({ success: false, msg: 'A user with this username does not exist', token: refreshedToken });
    }

    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: user.id });
    if (!userImages) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(404).json({ success: false, msg: 'This user has no images', token: refreshedToken });
    }

    const image_list = userImages.image_list;
    const image_list_array = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");
    const imageExists = image_list_array.includes(img);
    if (!imageExists) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(400).json({ success: false, msg: 'Image not found', token: refreshedToken });
    }
    const filePath = path.join(__dirname, '../imgUploads', img);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).sendFile(filePath);
  } catch (e) {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', e, token: refreshedToken });
  }
}