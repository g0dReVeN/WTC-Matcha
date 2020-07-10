const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const { jwt_private_key, jwt_public_key } = require('../config/config');

exports.signToken = (user) => {
  return new Promise((resolve, reject) => {
    let tagList = user.tags;
    if (!Array.isArray(tagList))
      tagList = tags.substring(1, tagList.length - 1).replace(/"/g, '').split(",");
    const userData = {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      tags: tagList,
      age: user.age,
      location: user.location,
      fame_rating: user.fame_rating,
      gender: user.gender,
      sexual_preference: user.sexual_preference,
      biography: user.biography,
      completed_profile: user.completed_profile,
      blocked_users: user.blocked_users,
      num_of_images: user.num_of_images,
      reset_token: user.reset_token,
      reset_token_expiration: user.reset_token_expiration,
      active_status: user.active_status,
    };
    jwt.sign(userData, jwt_private_key, {
      algorithm: 'ES256',
      expiresIn: 60 * 60,
    }, (err, newToken) => {
      if (err) {
        console.log(`Error creating token: ${err}`);
        resolve(null);
        return reject(err);
      }
      resolve(newToken);
      return reject(null);
    });
  });
}

const asyncFindUser = async (decodedData) => {
  try {
    const User = await UserModel;
    const user = await User.findOne({ username: decodedData.username });
    if (!user)
      return ({ success: false, msg: "User does not exist." });
    return ({ success: true, msg: "Token valid!", user: user });
  } catch (e) {
    return ({ success: false, msg: 'Internal server error' });
  }
}

exports.verifyToken = (token) => {
  return new Promise((resolve) => {
    if (!token) {
      resolve({ success: false, msg: "No token provided" });
      return reject(null);
    }
    jwt.verify(token, jwt_public_key, (err, decodedData) => {
      if (err) {
        return resolve({ success: false, msg: "Internal server error" });
      }
      resolve(asyncFindUser(decodedData));
    });
  });
}