const crude = require('../config/db');

const tagsSchema = crude.createSchema("tags", {
    id: {
        type: '$serial',
        primaryKey: true
    },
    tag_list: {
        type: '$text',
        typeArray: '[]',
        null: true
    }
}
);

module.exports = tagsSchema.then((tags) => {
    return crude.createModel("tags", tags);
});