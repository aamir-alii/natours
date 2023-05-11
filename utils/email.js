const pug = require('pug');
const { htmlToText } = require('html-to-text');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Aamir Ali <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASS,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.MAIL_TRAP_HOST,
      port: 2525,
      auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASS,
      },
    });
  }

  async send(template, subject) {
    // send the actual email
    // [x] render html based on pug template
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: subject,
    });
    // [x] Email Options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      html,
    };

    await this.createTransport().sendMail(emailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid only for 10min)'
    );
  }
};
