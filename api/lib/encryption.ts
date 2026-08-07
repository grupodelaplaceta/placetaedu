import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const getSecretKey = () => {
  const secret = process.env.IDENCRYPT;
  if (!secret) return crypto.scryptSync('default_fallback_secret_key_please_change_this', 'salt', 32);
  return crypto.scryptSync(secret, 'salt', 32);
}

export const encrypt = (text: string) => {
  if (!text) return text;
  if (text.startsWith('enc:')) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, getSecretKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return 'enc:' + iv.toString('hex') + ':' + encrypted;
  } catch (e) {
    return text;
  }
};

export const decrypt = (text: string) => {
  if (!text) return text;
  if (!text.startsWith('enc:')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const decipher = crypto.createDecipheriv(algorithm, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return text;
  }
};
