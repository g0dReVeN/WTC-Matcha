const crude = require("crudeorm").default;

const configEnv = require('./config');

const dbDetails = {
    host: configEnv.host,
    port: configEnv.db_port,
    database: configEnv.database,
    user: configEnv.user,
    password: configEnv.password,
    max: configEnv.max,
    idleTimeoutMillis: configEnv.idleTimeoutMillis,
    connectionTimeoutMillis: configEnv.connectionTimeoutMillis,
    ssl: configEnv.ssl,
}

const CRUDe = new crude(dbDetails, true);

module.exports = CRUDe;