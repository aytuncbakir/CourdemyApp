const nodemailer = require('nodemailer');
const config = require('../config/config');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.email.username,
    pass: config.email.password,
  },
});

module.exports = transporter;
