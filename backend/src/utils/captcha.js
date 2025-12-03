const axios = require("axios");

async function verifyCaptcha(token, remoteIp) {
  const params = new URLSearchParams();
  params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
  params.append("response", token);
  if (remoteIp) params.append("remoteip", remoteIp);

  const resp = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return resp.data;
}

module.exports = { verifyCaptcha };
