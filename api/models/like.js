const crude = require('../config/db');

const userLikeSchema = crude.createSchema("user_like", {
    id: {
        type: '$serial',
        primaryKey: true
    },
    user_id: {
        type: '$int',
        unique: true
    },
    like_list: {
        type: '$int',
        typeArray: '[]',
        null: true
    }
}, {
    user_like_user_user_id_fkey: {
        foreignKey: "user_id",
        references: "users(id)",
        match: "$simple",
        update: "$na",
        delete: "$cascade"
    }
}
);

module.exports = userLikeSchema.then((userLike) => {
    return crude.createModel("user_like", userLike);
});