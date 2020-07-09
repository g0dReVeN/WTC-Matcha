const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const resetTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resetToken: {
        type: String,
        required: true
    },
    resetTokenExpiration: Date
});

module.exports = mongoose.model('resetToken', resetTokenSchema);