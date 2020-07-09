const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    server_port: process.env.PORT,
    jwt_private_key: process.env.JWT_PRIVATE_KEY,
    jwt_public_key: process.env.JWT_PUBLIC_KEY,
    google_account: process.env.RDU_TOI_GOOGLE_ACCOUNT,
    google_password: process.env.RDU_TOI_GOOGLE_PASS,
    host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statementTimeout: 10000,
    keepAlive: true,
    ssl: { rejectUnauthorized: false },
};