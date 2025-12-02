const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendResetEmail(to, token) {
  return transporter.sendMail({
    from: `Sistema <${process.env.SMTP_USER}>`,
    to,
    subject: "Código de redefinição de senha",
    html: `
      <h3>Seu código para redefinir senha:</h3>
      <h1 style="color:#3a8bff">${token}</h1>
      <p>Ele expira em 15 minutos.</p>
    `
  });
}

module.exports = { sendResetEmail };
