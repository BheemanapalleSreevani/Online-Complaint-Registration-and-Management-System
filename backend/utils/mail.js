const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configurations are not fully set up or are mock, write to console
  if (
    !process.env.SMTP_HOST ||
    process.env.SMTP_HOST === 'smtp.mailtrap.io' && process.env.SMTP_USER === 'mockuser'
  ) {
    console.log('================ EMAIL SIMULATION ================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('==================================================');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = sendEmail;
