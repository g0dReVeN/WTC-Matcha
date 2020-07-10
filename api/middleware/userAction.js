const UserModel = require('../models/user');
const HistoryModel = require('../models/history');
const LikeModel = require('../models/like');
const ConnectedModel = require('../models/connected');
const ReportModel = require('../models/report');

module.exports = async ({ user = null, action = null, user_id = null, username = null }, cb) => {
  try {
    if (action === 'like') {
      if (!user_id && !username)
        return cb({ status: 400, success: false, msg: 'No user_id and username given' });

      const user_username = user.username;
      const first_user = user_username.localeCompare(username) == -1 ? user_username : username;
      const second_user = first_user === user_username ? username : user_username;
      const first_user_id = first_user === user_username ? user.id : user_id;
      const second_user_id = second_user === username ? user_id : user.id;
      const Connected = await ConnectedModel;
      const connected = await Connected.findOne({ room: `${first_user}-${second_user}` });

      const Like = await LikeModel;
      let resultLikes = await Like.findOne({ user_id: user.id });
      let like_list = [];
      let liked = false;
      if (!resultLikes) {
        like_list.push(user_id);
        await new Like({
          user_id: user.id,
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
            cb({ status: 200, success: true, msg: 'Like removed and users are now disconnected', action: 'disconnect' });
            await Connected.destroyById(connected.id);
            resultLikes = await Like.findOne({ user_id });
            const other_user_like_list = resultLikes.like_list.filter(value => value != user.id);
            await Like.update({ like_list: other_user_like_list }, { user_id });
          } else
            cb({ status: 200, success: true, msg: 'Like removed', action: 'unlike' });
          return await Like.update({ like_list }, { user_id: user.id });
        }
        like_list.push(user_id);
        await Like.update({ like_list }, { user_id: user.id });
      }
      resultLikes = await Like.findOne({ user_id });
      if (resultLikes) {
        resultLikes.like_list.forEach(val => {
          if (val === user.id)
            liked = true;
        });
      }
      if (!liked)
        return cb({ status: 200, success: true, msg: 'Like added', action: 'like' });
      await new Connected({
        first_user_id,
        second_user_id,
        room: `${first_user}-${second_user}`,
        messages: []
      });
      return cb({ status: 200, success: true, msg: 'Like added and users are now connected', action: 'connect' });
    } else if (action === 'consult') {
      if (!user_id)
        return cb({ status: 400, success: false, msg: 'No user_id given' });
      const History = await HistoryModel;
      const history = await History.findOne({ user_id: user.id });
      let history_list = [];
      if (!history) {
        history_list.push(user_id);
        await new History({
          user_id: user.id,
          history_list
        });
      } else {
        history_list = history.history_list;
        history_list.push(user_id);
        await History.update({ history_list }, { user_id: user.id });
      }
      return cb({ status: 200, success: true, msg: 'Consult added', action: 'consult' });
    } else if (action === 'block') {
      if (!user_id) {
        return cb({ status: 400, success: false, msg: 'No user_id given' });
      }
      const User = await UserModel;
      let blocked_users = user.blocked_users;
      if (!blocked_users || !blocked_users.length)
        blocked_users = [];
      if (blocked_users.includes(user_id)) {
        blocked_users = user.blocked_users.filter(value => value != user_id);
        await User.update({ blocked_users }, { id: user.id });
        return cb({ status: 200, success: false, msg: 'Blocked user removed', action: 'unblock' });
      }
      blocked_users.push(user_id);
      await User.update({ blocked_users }, { id: user.id });
      return cb({ status: 200, success: true, msg: 'Blocked user added', action: 'block' });
    } else if (action === 'report') {
      if (!user_id)
        return cb({ status: 400, success: false, msg: 'No user_id given' });
      const Report = await ReportModel;
      const report = await Report.findOne({ user_id: user.id });
      let report_list = [];
      if (!report) {
        report_list.push(user_id);
        await new Report({
          user_id: user.id,
          report_list
        });
      } else {
        report_list = report.report_list;
        if (report_list.includes(user_id)) {
          report_list = report.report_list.filter(value => value != user_id);
          await Report.update({ report_list }, { user_id: user.id });
          return cb({ status: 200, success: true, msg: 'User report removed', action: 'unreport' });
        }
        report_list.push(user_id);
        await Report.update({ report_list }, { user_id: user.id });
        return cb({ status: 200, success: true, msg: 'User report added', action: 'report' });
      }
    }
  } catch (e) {
    console.log(e);
    cb({ status: 500, success: false, msg: 'Internal server error' });
  }
}