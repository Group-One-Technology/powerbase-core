import CryptoJS from 'crypto-js';

const key = process.env.API_ENCRYPTION_KEY;

export function encrypt(text, initialIv) {
  const iv = String(initialIv).padStart(16, '0');
  const ciphertext = CryptoJS.enc.Utf8.parse(text);
  const cipherKey = CryptoJS.enc.Utf8.parse(key);
  const cipherIv = CryptoJS.enc.Utf8.parse(iv);
  return CryptoJS.AES.encrypt(ciphertext, cipherKey, { iv: cipherIv });
}

export function decrypt(text, initialIv) {
  const iv = String(initialIv).padStart(16, '0');
  const ciphertext = CryptoJS.enc.Base64.parse(text.replace(/(\r\n|\n|\r)/gm, ''));
  const cipherKey = CryptoJS.enc.Utf8.parse(key);
  const cipherIv = CryptoJS.enc.Utf8.parse(iv);
  const value = CryptoJS.AES.decrypt({ ciphertext }, cipherKey, {
    iv: cipherIv,
  });
  return value.toString(CryptoJS.enc.Utf8);
}
