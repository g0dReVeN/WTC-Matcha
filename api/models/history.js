const crude = require('../config/db');

const userHistorySchema = crude.createSchema("user_history", {
    id: {
        type: '$serial',
        primaryKey: true
    },
    user_id: {
        type: '$int',
        unique: true
    },
    history_list: {
        type: '$int',
        typeArray: '[]',
        null: true
    }
}, {
    user_history_user_user_id_fkey: {
        foreignKey: "user_id",
        references: "users(id)",
        match: "$simple",
        update: "$na",
        delete: "$cascade"
    }
}
);

module.exports = userHistorySchema.then((userHistory) => {
    return crude.createModel("user_history", userHistory);
});