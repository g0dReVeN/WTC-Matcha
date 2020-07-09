const path = require('path');
const fs = require('fs');

const UserModel = require('../models/user');
const HistoryModel = require('../models/history');
const UserImagesModel = require('../models/images');

exports.patchEditProfile = async (req, res, next) => {
  const { age, location, gender, sexual_preference, biography, tags } = req.body;
  let completed_profile = false;

  try {
    // const User = await UserModel;
    // const user = await User.findOne({ id: req.user.id });
    if ((age || req.user.age) && (location || req.user.location) && (gender || req.user.gender) && (sexual_preference || req.user.sexual_preference) && (biography || req.user.biography) && (Array.isArray(tags) || req.user.tags.length))
      completed_profile = true;
    await User.update({ age, gender, location: JSON.stringify(location), sexual_preference, biography, tags: tags.toString(), completed_profile }, { id: req.user.id });
    return res.status(200).json({ success: true, msg: 'User profile updated' });
  } catch (e) {
    res.status(500).json({ success: false, msg: 'Internal server error', e });
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
    return res.status(200).json({ success: true, msg: 'History added' });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', err });
  }
}

exports.putSingleUserImage = async (req, res, next) => {
  if (!req.files)
    return res.status(401).json({ success: false, msg: "Error uploading or no image uploaded" });
  if (req.files.length != 1)
    return res.status(401).json({ success: false, msg: "Too many images sent" });

  try {
    const id = req.user.id;
    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: id });

    const fileNameNum = req.files[0].fieldname.charAt(3);
    const imgName = req.files[0].fieldname.substring(0, 3) === 'img';
    if (!imgName || !fileNameNum)
      return res.status(401).json({ success: false, msg: 'Incorrect request paramater format' });
    if (!userImages) {
      let imageList = [null, null, null, null];
      let profileImage = null;
      if (fileNameNum !== '0' && !isNaN(fileNameNum))
        imageList[parseInt(fileNameNum) - 1] = req.files[0].filename;
      else if (fileNameNum === '0')
        profileImage = req.files[0].filename;
      await new UserImages({
        user_id: req.user.id,
        image_list: imageList,
        profile_image: profileImage
      });
    } else {
      const image_list = userImages.image_list;
      const image_list_array = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");
      image_list_array.forEach((val, index, arr) => {
        if (val === 'NULL')
          arr[index] = null;
      })
      let profile_image = userImages.profile_image;
      if (fileNameNum !== '0' && !isNaN(fileNameNum))
        image_list_array[parseInt(fileNameNum) - 1] = req.files[0].filename;
      else if (fileNameNum === '0') {
        profile_image = req.files[0].filename;
      }
      await UserImages.update({ image_list: image_list_array, profile_image }, { user_id: id });
    }
    return res.status(200).json({ success: true, msg: 'Image uploaded' });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e })
  }
}

exports.putMultipleUserImages = async (req, res, next) => {
  if (!req.files)
    return res.status(401).json({ success: false, msg: "Error uploading or no images uploaded" });
  if (req.files.length > 5)
    return res.status(401).json({ success: false, msg: "Too many images sent" });
  try {
    const id = req.user.id;
    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: id });

    if (!userImages) {
      let imageList = [null, null, null, null];
      let profileImage = null;
      req.files.forEach(file => {
        const fileNameNum = file.fieldname.charAt(3);
        const imgName = file.fieldname.substring(0, 3) === 'img';
        if (!imgName || !fileNameNum)
          return res.status(401).json({ success: false, msg: 'Incorrect request paramater format' });
        if (fileNameNum !== '0' && !isNaN(fileNameNum))
          imageList[parseInt(fileNameNum) - 1] = file.filename;
        else if (fileNameNum === '0')
          profileImage = req.files[0].filename;
      });
      await new UserImages({
        user_id: req.user.id,
        image_list: imageList,
        profile_image: profileImage
      });
    } else {
      const image_list = userImages.image_list;
      const image_list_array = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");
      image_list_array.forEach((val, index, arr) => {
        if (val === 'NULL')
          arr[index] = null;
      })
      let profile_image = userImages.profile_image;
      req.files.forEach(file => {
        const fileNameNum = file.fieldname.charAt(3);
        const imgName = file.fieldname.substring(0, 3) === 'img';
        if (!imgName || !fileNameNum)
          return res.status(401).json({ success: false, msg: 'Incorrect request paramater format' });
        if (fileNameNum !== '0' && !isNaN(fileNameNum))
          image_list_array[parseInt(fileNameNum) - 1] = file.filename;
        else if (fileNameNum === '0') {
          profile_image = req.files[0].filename;
        }
      });
      await UserImages.update({ image_list: image_list_array, profile_image }, { user_id: id });
    }
    return res.status(200).json({ success: true, msg: 'Image(s) uploaded' });
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}

exports.deleteUserImage = async (req, res, next) => {
  const img = req.params.img;
  let filePath;
  let imgToDelete = null;

  try {
    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: req.user.id });

    if (!userImages)
      return res.status(404).json({ success: false, msg: 'This user has no images' });

    const fileNameNum = img.charAt(3);
    const imgName = img.substring(0, 3) === 'img';

    if (!imgName || !fileNameNum)
      return res.status(401).json({ success: false, msg: 'Incorrect request paramater format' });

    if (fileNameNum === '0') {
      imgToDelete = userImages.profile_image;
      if (!imgToDelete)
        return res.status(400).json({ success: false, msg: 'There is no image to delete' });
      await UserImages.update({ profile_image: '' }, { user_id: req.user.id });
    }
    else if (fileNameNum !== '0' && !isNaN(fileNameNum)) {
      const image_list = userImages.image_list;
      const image_list_array = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",");
      image_list_array.forEach((val, index, arr) => {
        if (val === 'NULL')
          arr[index] = null;
      });
      imgToDelete = image_list_array[parseInt(fileNameNum) - 1];
      if (!imgToDelete)
        return res.status(400).json({ success: false, msg: 'There is no image to delete' });
      image_list_array[parseInt(fileNameNum) - 1] = null;
      console.log(image_list_array, imgToDelete);
      await UserImages.update({ image_list: image_list_array }, { user_id: req.user.id });
    }
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
  filePath = path.join(__dirname, '../imgUploads', imgToDelete);
  fs.unlink(filePath, err => {
    if (err)
      console.log(err);
  });
  return res.status(200).json({ success: true, msg: 'Image successfully deleted' });
}

exports.getUserImages = async (req, res, next) => {
  const { username, img } = req.params;

  try {
    const User = await UserModel;
    const user = await User.findOne({ username: username });

    if (!user)
      return res.status(404).json({ success: false, msg: 'A user with this username does not exist' });

    const UserImages = await UserImagesModel;
    const userImages = await UserImages.findOne({ user_id: user.id });
    if (!userImages)
      return res.status(404).json({ success: false, msg: 'This user has no images' });

    const fileNameNum = img.charAt(3);
    const imgName = img.substring(0, 3) === 'img';
    let resImage = null;
    if (!imgName || !fileNameNum)
      return res.status(401).json({ success: false, msg: 'Incorrect request paramater format' })
    if (fileNameNum === '0')
      resImage = userImages.profile_image;
    else if (fileNameNum !== '0' && !isNaN(fileNameNum)) {
      const image_list = userImages.image_list;
      resImage = image_list.substring(1, image_list.length - 1).replace(/"/g, '').split(",")[parseInt(fileNameNum) - 1];
    }
    if (!resImage)
      return res.status(400).json({ success: false, msg: 'Image not found' });
    const filePath = path.join(__dirname, '../imgUploads', resImage);
    return res.status(200).sendFile(filePath);
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}