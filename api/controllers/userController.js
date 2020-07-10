const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");
const path = require('path');
const fs = require('fs');

const crude = require('../config/db');

const UserModel = require('../models/user');
const HistoryModel = require('../models/history');
const UserNotificationModel = require('../models/notifications');
const TagsModel = require('../models/tags');
const LikeModel = require('../models/like');
const ConnectedModel = require('../models/connected');
const ReportModel = require('../models/report');

const jwtAuth = require('../middleware/jwtAuth');
const { type } = require('os');
const { conn } = require('../config/db');

const isEmpty = obj => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

const base64_encode = file => {
  return fs.readFileSync(file, { encoding: 'base64' });
}

const distanceBetweenPoints = (lat1, lon1, lat2, lon2) => {  // generally used geo measurement function
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

const refreshToken = async (user) => {
  try {
    const User = await UserModel;
    const last_connection = new Date();
    await User.update({ last_connection }, { username: user.username });
    user.last_connection = last_connection;
    const sameUser = await User.findOne({ username: user.username });
    if (!sameUser.images)
      sameUser.images = [];
    if (!sameUser.blocked_users)
      sameUser.blocked_users = [];
    const newToken = await jwtAuth.signToken(sameUser);
    if (!newToken)
      return false;
    return newToken;
  } catch (e) {
    console.log(e);
    return false;
  }
}

const sendNotification = async (user_id, newEntry) => {
  try {
    const UserNotification = await UserNotificationModel;
    const userNotification = await UserNotification.findOne({ user_id });
    if (!userNotification) {
      await new UserNotification({
        user_id,
        notification_list: [newEntry]
      });
    } else {
      const notification_list = userNotification.notification_list;
      notification_list.push(newEntry);
      await UserNotification.update({ notification_list }, { user_id });
    }
  } catch (e) {
    console.log(e);
    throw TypeError("Error adding notification");
  }
}

const numMatchingElemsInArray = (arr1, arr2) => {
  let count = 0;
  arr1.forEach(elem => {
    if (arr2.includes(elem))
      count++;
  });
  return count;
}

const doSort = (a, b, props, tags = []) => {
  if (a[props[0]] === b[props[0]]) {
    if (props.length > 1) {
      return doSort(a, b, props.slice(1));
    }
    return 0;
  }
  if (props[0] === 'tags') {
    const left = numMatchingElemsInArray(tags, a[props[0]]);
    const right = numMatchingElemsInArray(tags, b[props[0]]);
    if (left === right) {
      if (props.length > 1) {
        return doSort(a, b, props.slice(1));
      }
      return 0;
    }
    return (left > right) ? -1 : 1;
  }
  if (props[0] === 'fame_rating')
    return (a[props[0]] > b[props[0]]) ? -1 : 1;
  return (a[props[0]] < b[props[0]]) ? -1 : 1;
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
    lat = req.user.lat,
    long = req.user.long,
    gender = req.user.gender,
    sexual_preference = req.user.sexual_preference,
    biography = req.user.biography,
    tags = req.user.tags,
    firstname = req.user.firstname,
    lastname = req.user.lastname,
    email = req.user.email,
    password = req.user.password
  } = req.body;

  let coordinates = location;
  const images_to_delete = req.user.images;

  if (lat && long)
    coordinates = {
      lat,
      long
    }

  let completed_profile = false;
  if (age && coordinates && (gender == 0 || gender == 1) && (sexual_preference == 0 || sexual_preference == 1 || sexual_preference == 2) && biography && tags.length && firstname && lastname && email && password)
    completed_profile = true;

  try {
    const id = req.user.id;

    const imageList = [];
    req.files.forEach(image => {
      imageList.push(image.filename);
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    const sanitizedEntry = { age, gender, location: JSON.stringify(coordinates), sexual_preference, biography, tags: tags, completed_profile, firstname, lastname, email, password: hashedPassword, images: imageList };

    Object.keys(sanitizedEntry).forEach(key => {
      if (sanitizedEntry[key] === null)
        delete sanitizedEntry[key];
    });

    const User = await UserModel;
    await User.update(sanitizedEntry, { id: id });

    if (images_to_delete) {
      let images_to_delete_array = images_to_delete;
      if (images_to_delete_array && !Array.isArray(images_to_delete))
        images_to_delete_array = images_to_delete.substring(1, images_to_delete.length - 1).replace(/"/g, '').split(",");

      if (images_to_delete_array.length)
        images_to_delete_array.forEach(val => {
          const filePath = path.join(__dirname, '../imgUploads', val);
          fs.unlinkSync(filePath);
        });
    }
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

    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'User profile updated', token: refreshedToken });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.postUsers = async (req, res, next) => {
  try {
    const {
      filters,
      order = [],
      offset = 0
    } = req.body;
  
    if (order.length) {
      Object.keys(filters).forEach(key => {
        if (!order.includes(key))
          delete filters[key];
      });
    }
  
    let sql = `
    SELECT * FROM users WHERE
    active_status = true
    AND completed_profile = true
    AND (sexual_preference = 0 OR sexual_preference = ${req.user.gender})
    `;
    if (req.user.sexual_preference != 0)
      sql += ` AND gender = ${req.user.sexual_preference}`;
    if (filters.tags && filters.tags.length) {
      let filterTags;
      filterTags = '{';
      filters.tags.forEach((val, index) => {
        filterTags += '"';
        filterTags += val;
        filterTags += '"';
        if (index != filters.tags.length - 1)
          filterTags += ',';
      });
      filterTags += '}';
      sql += ` AND tags && '${filterTags}' `;
    }
    if (filters.age)
      sql += ` AND age >= ${filters.age[0]} AND age <= ${filters.age[1]}`;
    if (filters.fame_rating)
      sql += ` AND fame_rating >= ${filters.fame_rating[0]} AND fame_rating <= ${filters.fame_rating[1]}`;
  
    let resultSet;
  
    if (!order.length)
      sql += `ORDER BY id`;
  
    resultSet = await crude.conn.query(sql);
  
    const usersWithinRange = [];
    const userLat = req.user.location.lat;
    const userLong = req.user.location.long;
  
    resultSet.rows.forEach(user => {
      if (user.location && user.location.lat && user.location.long) {
        let distanceFound = distanceBetweenPoints(userLat, userLong, parseInt(user.location.lat), parseInt(user.location.long));
        distanceFound /= 1000;
        if (!filters.distance) {
          user.distance = distanceFound;
          usersWithinRange.push(user);
        }
        if (user.location && distanceFound <= filters.distance) {
          user.distance = distanceFound;
          usersWithinRange.push(user);
        }
      }
    });
  
    if (order.length) {
      if (filters.tags)
        usersWithinRange.sort((a, b) => doSort(a, b, order, filters.tags));
      else
        usersWithinRange.sort((a, b) => doSort(a, b, order));
    }
  
    const returnUsers = [];
    let limit = 0;
  
    usersWithinRange.forEach((val, index) => {
      if (index > offset && limit < 10) {
        limit++;
        returnUsers.push(val);
      }
    });

    const resultConnected = await crude.conn.query(`
      SELECT * FROM connected_users WHERE first_user_id=${req.user.id} OR second_user_id=${req.user.id}
    `);

    const connectedList = resultConnected.rows;

    const likesAndHistory = await crude.conn.query(`
      SELECT
        like_list,
        history_list,
        report_list
      FROM
        user_like l
      FULL OUTER JOIN user_history h
              ON h.user_id = l.user_id
      FULL OUTER JOIN user_report r
              ON r.user_id = l.user_id
      WHERE
        h.user_id = ${req.user.id} OR l.user_id = ${req.user.id};
      `);
    let likedUsers = [];
    if (likesAndHistory && likesAndHistory.rows.like_list)
      likedUsers = likesAndHistory.rows.like_list;
    let historyList = [];
    if (likesAndHistory && likesAndHistory.rows.history_list)
      historyList = likesAndHistory.rows.history_list;
    let reportList = [];
    if (likesAndHistory && likesAndHistory.rows.report_list)
      reportList = likesAndHistory.rows.report_list;
    let blockList = req.user.blocked_users;
    if (!blockList)
      blockList = [];
  
    returnUsers.forEach(val => {
      historyList.includes(val.id) ? val.consult = true : val.consult = false;
      likedUsers.includes(val.id) ? val.liked = true : val.liked = false;
      reportList.includes(val.id) ? val.reported = true : val.reported = false;
      blockList.includes(val.id) ? val.blocked = true : val.blocked = false;
      delete val.password;
      delete val.email;
      delete val.reset_token;
      delete val.reset_token_expiration;
      if (!val.images)
        val.images = [];
      if (!val.blocked_users)
        val.blocked_users = [];
      const encodedImages = [];
      val.images.forEach(image => {
        const filePath = path.join(__dirname, '../imgUploads', image);
        var ext = path.extname(filePath).substring(1);
        const encodedImage = "data:image/" + ext + ";base64," + base64_encode(filePath);
        if (encodedImage)
          encodedImages.push(encodedImage);
      });
      val.likes_back = false;
      val.images = encodedImages;
      val.likes_back = false;
      connectedList.forEach(connected => {
        if (connected.first_user_id === val.id || connected.second_user_id === val.id)
          val.likes_back = true;
      })
    });
  
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'Users found', users: returnUsers, token: refreshedToken });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.patchAction = async (req, res, next) => {
  const { action, user_id, username } = req.body;

  let newEntry;

  try {
    if (action === 'like') {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      if (!user_id && !username)
        return res.status(400).json({ success: false, msg: 'No user_id and username given', token: refreshedToken });

      const user_username = req.user.username;
      const first_user = user_username.localeCompare(username) == -1 ? user_username : username;
      const second_user = first_user === user_username ? username : user_username;
      const first_user_id = first_user === user_username ? req.user.id : user_id;
      const second_user_id = second_user === username ? user_id : req.user.id;
      const Connected = await ConnectedModel;
      const connected = await Connected.findOne({ room: `${first_user}-${second_user}` });
      console.log("first_user: " + first_user);
      console.log("second_user: " + second_user);
      console.log("first_user_id: " + first_user_id);
      console.log("second_user_id: " + second_user_id);

      const Like = await LikeModel;
      let resultLikes = await Like.findOne({ user_id: req.user.id });
      let like_list = [];
      let liked = false;
      if (!resultLikes) {
        like_list.push(user_id);
        await new Like({
          user_id: req.user.id,
          like_list
        });
      } else {
        like_list = resultLikes.like_list;
        like_list.forEach(val => {
          if (val === user_id)
            liked = true;
        });
        if (liked) {
          like_list = resultLikes.like_list.filter(value => value != user_id);
          if (connected) {
            newEntry = { action: 'disconnect', user_id: req.user.id, username: req.user.username, read: false };
            res.status(200).json({ success: true, msg: 'Like removed and users are now disconnected', action: 'disconnect', token: refreshedToken });
            await Connected.destroyById(connected.id);
            resultLikes = await Like.findOne({ user_id });
            const other_user_like_list = resultLikes.like_list.filter(value => value != req.user.id);
            await Like.update({ like_list: other_user_like_list }, { user_id });
          } else {
            newEntry = { action: 'unlike', user_id: req.user.id, username: req.user.username, read: false };
            res.status(200).json({ success: true, msg: 'Like removed', action: 'unlike', token: refreshedToken });
          }
          await Like.update({ like_list }, { user_id: req.user.id });
          try {
            return await sendNotification(user_id, newEntry);
          } catch (e) {
            console.log(e);
            return console.log(e);
          }
        }
        like_list.push(user_id);
        await Like.update({ like_list }, { user_id: req.user.id });
      }
      resultLikes = await Like.findOne({ user_id });
      if (resultLikes) {
        resultLikes.like_list.forEach(val => {
          if (val === req.user.id)
            liked = true;
        });
      }
      if (!liked) {
        newEntry = { action: 'like', user_id: req.user.id, username: req.user.username, read: false };
        res.status(200).json({ success: true, msg: 'Like added', action: 'like', token: refreshedToken });
        try {
          return await sendNotification(user_id, newEntry);
        } catch (e) {
          console.log(e);
          return console.log(e);
        }
      }
      await new Connected({
        first_user_id,
        second_user_id,
        room: `${first_user}-${second_user}`,
        messages: []
      });
      res.status(200).json({ success: true, msg: 'Like added and users are now connected', action: 'connect', token: refreshedToken });
      newEntry = { action: 'connect', user_id: req.user.id, username: req.user.username, read: false };
      try {
        await sendNotification(user_id, newEntry);
      } catch (e) {
        console.log(e);
      }
    } else if (action === 'consult') {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      if (!user_id)
        return res.status(400).json({ success: false, msg: 'No user_id given', token: refreshedToken });
      const History = await HistoryModel;
      const history = await History.findOne({ user_id: req.user.id });
      let history_list = [];
      if (!history) {
        history_list.push(user_id);
        await new History({
          user_id: req.user.id,
          history_list
        });
      } else {
        history_list = history.history_list;
        history_list.push(user_id);
        await History.update({ history_list }, { user_id: req.user.id });
      }
      res.status(200).json({ success: true, msg: 'Consult added', action: 'consult', token: refreshedToken });
      newEntry = { action: 'consult', user_id: req.user.id, username: req.user.username, read: false };
      try {
        await sendNotification(user_id, newEntry);
      } catch (e) {
        console.log(e);
      }
    } else if (action === 'block') {
      if (!user_id) {
        const refreshedToken = await refreshToken(req.user);
        if (!refreshedToken)
          return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
        return res.status(400).json({ success: false, msg: 'No user_id given', token: refreshedToken });
      }
      const User = await UserModel;
      let blocked_users = req.user.blocked_users;
      if (!blocked_users || !blocked_users.length)
        blocked_users = [];
      if (blocked_users.includes(user_id)) {
        blocked_users = req.user.blocked_users.filter(value => value != user_id);
        await User.update({ blocked_users }, { id: req.user.id });
        const refreshedToken = await refreshToken(req.user);
        if (!refreshedToken)
          return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
        return res.status(200).json({ success: false, msg: 'Blocked user removed', action: 'unblock', token: refreshedToken });
      }
      blocked_users.push(user_id);
      await User.update({ blocked_users }, { id: req.user.id });
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(200).json({ success: true, msg: 'Blocked user added', action: 'block', token: refreshedToken });
    } else if (action === 'report') {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      if (!user_id)
        return res.status(400).json({ success: false, msg: 'No user_id given', token: refreshedToken });
      const Report = await ReportModel;
      const report = await Report.findOne({ user_id: req.user.id });
      let report_list = [];
      if (!report) {
        report_list.push(user_id);
        await new Report({
          user_id: req.user.id,
          report_list
        });
      } else {
        report_list = report.report_list;
        if (report_list.includes(user_id)) {
          report_list = report.report_list.filter(value => value != user_id);
          await Report.update({ report_list }, { user_id: req.user.id });
          return res.status(200).json({ success: true, msg: 'User report removed', action: 'unreport', token: refreshedToken });
        }
        report_list.push(user_id);
        await Report.update({ report_list }, { user_id: req.user.id });
        return res.status(200).json({ success: true, msg: 'User report added', action: 'report', token: refreshedToken });
      }
    }
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!id) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(400).json({ success: false, msg: 'No user_id given', token: refreshedToken });
    }
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    const User = await UserModel;
    const result = await User.findById(id);
    if (!result)
      return res.status(404).json({ success: false, msg: ' User not found', token: refreshedToken });

    const likesAndHistory = await crude.conn.query(`
        SELECT
          like_list,
          history_list,
          report_list
        FROM
          user_like l
        FULL OUTER JOIN user_history h
                ON h.user_id = l.user_id
        FULL OUTER JOIN user_report r
                ON r.user_id = l.user_id
        WHERE
          h.user_id = ${id} OR l.user_id = ${id};
        `);
    let likedUsers = [];
    if (likesAndHistory && likesAndHistory.rows.like_list)
      likedUsers = likesAndHistory.rows.like_list;
    let historyList = [];
    if (likesAndHistory && likesAndHistory.rows.history_list)
      historyList = likesAndHistory.rows.history_list;
    let reportList = [];
    if (likesAndHistory && likesAndHistory.rows.report_list)
      reportList = likesAndHistory.rows.report_list;
    let blockList = req.user.blocked_users;
    if (!blockList)
      blockList = [];

    const user = {
      id: result.id,
      firstname: result.firstname,
      lastname: result.lastname,
      username: result.username,
      email: result.email,
      password: result.password,
      tags: result.tags,
      age: result.age,
      location: result.location,
      fame_rating: result.fame_rating,
      gender: result.gender,
      sexual_preference: result.sexual_preference,
      biography: result.biography,
      completed_profile: result.completed_profile,
      liked_users: likedUsers,
      history_list: historyList,
      report_list: reportList,
      blocked_users: blockList,
      images: result.images,
      last_connection: result.last_connection,
      active_status: result.active_status
    }
    if (!user.images)
      user.images = [];

    const encodedImages = [];
    user.images.forEach(image => {
      const filePath = path.join(__dirname, '../imgUploads', image);
      const encodedImage = base64_encode(filePath);
      if (encodedImage)
        encodedImages.push(encodedImage);
    });
    user.images = encodedImages;
    return res.status(200).json({ success: true, msg: ' User found', token: refreshedToken, user });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getTags = async (req, res, next) => {
  try {
    const Tags = await TagsModel;
    const tags = await Tags.findById(1);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    if (!tags)
      return res.status(200).json({ success: true, msg: 'No tags available', token: refreshedToken, tags: [] });
    return res.status(200).json({ success: true, msg: 'Tags found', token: refreshedToken, tags: tags.tag_list });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getUserNotificationList = async (req, res, next) => {
  try {
    const UserNotification = await UserNotificationModel;
    const userNotification = await UserNotification.findOne({ user_id: req.user.id });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    if (!userNotification) {
      return res.status(200).json({ success: true, msg: 'Notification list found', notification_list: [], token: refreshedToken });
    }
    const notification_list = userNotification.notification_list;

    res.status(200).json({ success: true, msg: 'Notification list found', notification_list, token: refreshedToken });
    notification_list.forEach((val, index, arr) => {
      arr[index].read = true;
    });
    try {
      await UserNotification.update({ notification_list }, { id: userNotification.id });
    } catch (e) {
      console.log(e);
      console.log(e);
    }

  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getUserHistory = async (req, res, next) => {
  try {
    const History = await HistoryModel;
    const history = await History.findOne({ user_id: req.user.id });
    if (!history) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(200).json({ success: true, msg: 'History list found', users: [], token: refreshedToken });
    }
    let formattedHistoryListArrayString = '(';
    history.history_list.forEach((val, index) => {
      formattedHistoryListArrayString += val;
      if (index != history.history_list.length - 1)
        formattedHistoryListArrayString += ',';
    });
    formattedHistoryListArrayString += ')';
    const sql = `SELECT id, username, images FROM users WHERE id IN ${formattedHistoryListArrayString}`;

    const resultSet = await crude.conn.query(sql);
    const resultUsers = resultSet.rows;
    resultUsers.forEach(val => {
      let image = null;
      if (val.images && val.images.length) {
        const filePath = path.join(__dirname, '../imgUploads', val.images[0]);
        var ext = path.extname(filePath).substring(1);
        const encodedImage = "data:image/" + ext + ";base64," + base64_encode(filePath);
        if (encodedImage)
          image = encodedImage;
      }
      val.image = image;
      delete val.images;
    });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'History list found', users: resultUsers, token: refreshedToken });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getUserLikes = async (req, res, next) => {
  try {
    const Like = await LikeModel;
    const like = await Like.findOne({ user_id: req.user.id });
    if (!like) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(200).json({ success: true, msg: 'Like list found', users: [], token: refreshedToken });
    }
    let formattedLikeListArrayString = '(';
    like.like_list.forEach((val, index) => {
      formattedLikeListArrayString += val;
      if (index != like.like_list.length - 1)
        formattedLikeListArrayString += ',';
    });
    formattedLikeListArrayString += ')';
    const sql = `SELECT * FROM users WHERE id IN ${formattedLikeListArrayString}`;

    const resultSet = await crude.conn.query(sql);
    const resultUsers = resultSet.rows;
    resultUsers.forEach(val => {
      delete val.password;
      delete val.email;
      delete val.reset_token;
      delete val.reset_token_expiration;
    });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'Like list found', users: resultUsers, token: refreshedToken });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getConnections = async (req, res, next) => {
  try {
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    // const Connected = await ConnectedModel;
    // const connected = await Connected.find({ first_user_id: req.user.id, second_user_id: req.user.id }, "", false);
    const connected = await crude.conn.query(`SELECT * FROM connected_users WHERE first_user_id = ${req.user.id} OR second_user_id = ${req.user.id}`);
    // console.log(connected.rows);
    // if (!connected)
    //   return res.status(200).json({ success: true, msg: 'Connected users list found', users: [], token: refreshedToken });
    const users = connected.rows;
    users.forEach(val => {
      const usernameList = val.room.split('-');
      if (req.user.username != usernameList[0])
        val.username = usernameList[0];
      else
        val.username = usernameList[1];
      val.messages.forEach((message, index, arr) => {
        arr[index] = JSON.parse(message);
      });
    });
    return res.status(200).json({ success: true, msg: 'Connected users list found', users, token: refreshedToken });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getUserReport = async (req, res, next) => {
  try {
    const Report = await ReportModel;
    const report = await Report.findOne({ user_id: req.user.id });
    if (!report) {
      const refreshedToken = await refreshToken(req.user);
      if (!refreshedToken)
        return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
      return res.status(200).json({ success: true, msg: 'Report list found', users: [], token: refreshedToken });
    }
    let formattedLikeListArrayString = '(';
    report.report_list.forEach((val, index) => {
      formattedLikeListArrayString += val;
      if (index != like.like_list.length - 1)
        formattedLikeListArrayString += ',';
    });
    formattedLikeListArrayString += ')';
    const sql = `SELECT * FROM users WHERE id IN ${formattedLikeListArrayString}`;

    const resultSet = await crude.conn.query(sql);
    const resultUsers = resultSet.rows;
    resultUsers.forEach(val => {
      delete val.password;
      delete val.email;
      delete val.reset_token;
      delete val.reset_token_expiration;
    });
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(200).json({ success: true, msg: 'Report list found', users: resultUsers, token: refreshedToken });
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}

exports.getUserImage = async (req, res, next) => {
  const img = req.params.img;

  try {
    const filePath = path.join(__dirname, '../imgUploads', img);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    fs.access(filePath, err => {
      if (err)
        return res.status(404).json({ success: false, msg: 'Image not found', token: refreshedToken });
    });
    return res.status(200).sendFile(filePath);
  } catch (e) {
    console.log(e);
    const refreshedToken = await refreshToken(req.user);
    if (!refreshedToken)
      return res.status(500).json({ success: false, msg: 'Token could not be generated at this time' });
    return res.status(500).json({ success: false, msg: 'Internal server error', token: refreshedToken });
  }
}