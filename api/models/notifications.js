const crude = require('../config/db');

const userNotificationSchema = crude.createSchema("user_notification", {
    id: {
        type: '$serial',
        primaryKey: true
    },
    user_id: {
        type: '$int',
        unique: true
    },
    notification_list: {
        type: '$json',
        typeArray: '[]',
        null: true
    }
}, {
    user_notification_user_user_id_fkey: {
        foreignKey: "user_id",
        references: "users(id)",
        match: "$simple",
        update: "$na",
        delete: "$cascade",
    }
}
);

module.exports = userNotificationSchema.then((userNotification) => {
    return crude.createModel("user_notification", userNotification);
});