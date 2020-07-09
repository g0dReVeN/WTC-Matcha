const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const { jwt_private_key, jwt_public_key } = require('../config/config');

exports.signToken = (user) => {
  return new Promise((resolve, reject) => {
    const userData = {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      tags: user.tags,
      age: user.age,
      location: user.location,
      fame_rating: user.fame_rating,
      gender: user.gender,
      sexual_preference: user.sexual_preference,
      biography: user.biography,
      completed_profile: user.completed_profile,
      blocked_by_users: user.blocked_by_users,
      reset_token: user.reset_token,
      reset_token_expiration: user.reset_token_expiration,
      active_status: user.active_status,
    };
    // const userData = user.toObject();
    // delete userData.password;
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
      // const id = decodedData._id;
      // User.findOne({ username: decodedData.username })
      // .then(user => {
      //   console.log("HERERERERERE!");
      //   if (!user) {
      //     resolve({ success: false, msg: "User does not exist." });
      //     return reject(null);
      //   }
      //   resolve({ success: true, msg: "Token valid!", user: user });
      //   return reject(null);
      // })
      // .catch(err => {
      //   reject(err);
      //   return resolve(null);
      // })
      resolve(asyncFindUser(decodedData));
    });
  });
}