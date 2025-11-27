import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

// CODIFICA SEM GERAR BARRAS / E CARACTERES PROBLEMÁTICOS
export function encodeId(id) {
  if (!SECRET_KEY) {
    console.error("ERRO: REACT_APP_SECRET_KEY não definido no .env do frontend!");
  }
  
  const encrypted = CryptoJS.AES.encrypt(String(id), SECRET_KEY).toString();
  return encodeURIComponent(encrypted);
}

// DECODIFICA NORMALMENTE
export function decodeId(encoded) {
  try {
    const decoded = decodeURIComponent(encoded);
    const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (err) {
    return null;
  }
}
