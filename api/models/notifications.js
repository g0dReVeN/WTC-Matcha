const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationListSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notificationList: [notificationListSchema]
});

module.exports = mongoose.model('Notification', notificationSchema);