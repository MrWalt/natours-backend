const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const Transport = require("nodemailer-brevo-transport");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Natours Team <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // SendinBlue cause SendGrid sucks!

      // return nodemailer.createTransport({
      //   host: process.env.SENDINBLUE_HOST,
      //   port: process.env.SENDINBLUE_PORT,
      //   secure: false,
      //   auth: {
      //     user: process.env.SENDINBLUE_USER,
      //     pass: process.env.SENDINBLUE_PASS,
      //   },
      // });
      return nodemailer.createTransport(
        new Transport({ apiKey: `${process.env.SENDINBLUE_APIKEY}` })
      );
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // Send the email
    // Render the HTML for the email
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText.fromString(html),
      html,
    };

    // Create a transport and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};

// async function sendEmail(options) {
// Create a transporter FOR GMAIL
//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     // We also active less secure app in gmail
//   });
// A few steps to follow to send email with nodemailer
// Create a transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.MAILTRAP_HOST,
//   port: process.env.MAILTRAP_PORT,
//   auth: {
//     user: process.env.MAILTRAP_USERNAME,
//     pass: process.env.MAILTRAP_PASSWORD,
//   },
// });
// Define the email options
// const mailOptions = {
//   from: "Natours <natours@horse.io>",
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
// };
// Send the email with nodemailer
// await transporter.sendMail(mailOptions);
// }
