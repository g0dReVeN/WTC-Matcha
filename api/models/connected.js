const crude = require('../config/db');

const connectedUsersSchema = crude.createSchema("connected_users", {
  id: {
    type: '$serial',
    primaryKey: true
  },
  first_user_id: {
    type: '$int'
  },
  second_user_id: {
    type: '$int'
  },
  room: {
    type: '$text',
    unique: true
  },
  messages: {
    type: '$text',
    typeArray: '[]',
    null: true
  }
}, {
  connected_users_user_first_user_id_fkey: {
    foreignKey: "first_user_id",
    references: "users(id)",
    match: "$simple",
    update: "$na",
    delete: "$cascade"
  },
  connected_users_user_second_user_id_fkey: {
    foreignKey: "second_user_id",
    references: "users(id)",
    match: "$simple",
    update: "$na",
    delete: "$cascade"
  }
}
);

module.exports = connectedUsersSchema.then((connectedUsers) => {
  return crude.createModel("connected_users", connectedUsers);
});