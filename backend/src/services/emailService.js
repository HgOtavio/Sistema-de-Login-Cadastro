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
      <html>
      <head>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: #000;
            font-family: Arial, sans-serif;
            color: #fff;
          }

          .email-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          .email-box {
            background: #121212;
            padding: 30px;
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
            text-align: center;
            border: 1px solid rgba(58,139,255,0.25);
            box-sizing: border-box;
          }

          .email-box h2 {
            color: #66aaff;
            margin-bottom: 20px;
          }

          .email-box p {
            margin-bottom: 25px;
            color: #b8c9ff;
          }

          .code {
            font-size: 32px;
            font-weight: bold;
            color: #3a8bff;
            margin-bottom: 20px;
          }

          .footer {
            font-size: 14px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-box">
            <h2>Redefinição de senha</h2>
            <p>Use o código abaixo para redefinir sua senha. Ele expira em 15 minutos.</p>
            <div class="code">${token}</div>
            <p class="footer">Se você não solicitou esta redefinição, ignore este email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
}

module.exports = { sendResetEmail };
