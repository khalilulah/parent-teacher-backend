const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(options) {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      // secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL, // generated ethereal user
        pass: process.env.SMTP_PASSWORD, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL, // sender address
      to: options?.email, // list of receivers
      subject: options?.subject, // Subject line
      html: options?.html,
    });
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = sendMail;
