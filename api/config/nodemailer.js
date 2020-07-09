// const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");

// const transporter = nodemailer.createTransport(
//     sendgridTransport({
//         auth: { api_key: process.env.SENDGRID }
//     })
// );

// module.exports = transporter;

const nodemailer = require("nodemailer");

const { google_account, google_password } = require('./config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: google_account,
        pass: google_password
    }
});

module.exports = transporter;