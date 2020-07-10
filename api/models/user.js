const crude = require('../config/db');

const userSchema = crude.createSchema("users", {
    id: {
        type: '$serial',
        primaryKey: true,
        unique: true
    },
    username: {
        type: '$varchar',
        typeSize: 15
    },
    firstname: {
        type: '$varchar',
        typeSize: 30
    },
    lastname: {
        type: '$varchar',
        typeSize: 30
    },
    email: {
        type: '$varchar',
        typeSize: 254,
        unique: true
    },
    password: {
        type: '$varchar',
        typeSize: 60, // Bcrypt hash length as stated by docs
    },
    tags: {
        type: '$text',
        typeArray: '[]',
        null: true
    },
    age: {
        type: '$si',
        check: 'age > 17',
        null: true
    },
    location: {
        type: '$json',
        null: true
    }, // { lat: integer, long: integer }
    fame_rating: {
        type: '$si',
        default: 0,
        null: true
    }, // min: 0; max: 100
    gender: {
        type: '$si',
        default: 0, // 0 = Not known; 1 = Male; 2 = Female; 9 = Not applicable; as per ISO/IEC 5218
        null: true
    },
    sexual_preference: {
        type: '$si',
        default: 0,
        null: true
    },
    biography: {
        type: '$text',
        null: true
    },
    completed_profile: {
        type: '$bool',
        default: false,
        null: true
    },
    blocked_users: {
        type: '$int',
        typeArray: '[]',
        null: true
    },
    num_of_images: {
        type: '$si',
        default: 0
    },
    last_connection: {
        type: '$ts',
        null: true
    },
    reset_token: {
        type: '$text',
        null: true
    },
    reset_token_expiration: {
        type: '$ts',
        null: true
    },
    active_status: {
        type: '$bool',
        default: false,
        null: true
    }
});

module.exports = userSchema.then((user) => {
    return crude.createModel("User", user);
});