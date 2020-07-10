const crude = require('../config/db');

const userImagesSchema = crude.createSchema("user_images", {
    id: {
        type: '$serial',
        primaryKey: true
    },
    user_id: {
        type: '$int',
        unique: true
    },
    image_list: {
        type: '$text',
        arrayType: '[]',
        null: true
    }
}, {
    user_images_user_user_id_fkey: {
        foreignKey: "user_id",
        references: "users(id)",
        match: "$simple",
        update: "$na",
        delete: "$cascade",
    }
}
);

module.exports = userImagesSchema.then((userImages) => {
    return crude.createModel("user_images", userImages);
});