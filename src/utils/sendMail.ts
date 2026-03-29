import { ENV } from './../config/env.config';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.SEND_MAIL_NAME,
    pass: ENV.SEND_MAIL_PASSWORD, // normal password na
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await await transporter.sendMail({
      from: `"MCTL" <${ENV.SEND_MAIL_NAME}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
