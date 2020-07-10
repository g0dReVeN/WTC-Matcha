const UserModel = require('../models/user');

const jwtAuth = require('./jwtAuth');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization') || req.body.token; // req.body.token needs to be removed after
  try {
    const response = await jwtAuth.verifyToken(token);
    if (response.success === false)
      return res.status(400).json({ success: false, msg: 'Token invalid' });
    req.user = response.user;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, msg: 'Internal server error', e });
  }
}