const crude = require('../config/db');

const userReportSchema = crude.createSchema("user_report", {
  id: {
    type: '$serial',
    primaryKey: true
  },
  user_id: {
    type: '$int',
    unique: true
  },
  report_list: {
    type: '$int',
    typeArray: '[]',
    null: true
  }
}, {
  user_report_user_user_id_fkey: {
    foreignKey: "user_id",
    references: "users(id)",
    match: "$simple",
    update: "$na",
    delete: "$cascade"
  }
}
);

module.exports = userReportSchema.then((userReport) => {
  return crude.createModel("user_report", userReport);
});