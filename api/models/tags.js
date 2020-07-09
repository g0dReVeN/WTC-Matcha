const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('Tags', tagsSchema);