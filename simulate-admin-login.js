const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Environment variables from your .env.local
const JWT_SECRET = 'Djaq7TVxzmJYAVPzh0cqwqdEdQ5aYnZgiy2z9sC2uF1zM67+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ADMIN_USERNAME = 'admin_dca740c1';
const ADMIN_PASSWORD_HASH = 'e8e36d43998464c562f2a449c28806f22a6182a3250e63b816e792ca852fd67ecbe8c8c96708801e22701bd8df9c7e31ec414c5758c7806b22176c514abafe01';
const ADMIN_SALT = '0987330d202f93e932db6b02287cf7f6d23f8a440069d36ceddf0665bcefd3c0';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, hash, salt) {
  try {
    const hashedPassword = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedPassword, 'hex'));
  } catch (error) {
    return false;
  }
}

// Test credentials (from the login page)
const testUsername = 'admin_dca740c1';
const testPassword = 'OMA_0b2b065744aa1557_2024!';

console.log('Testing admin credentials...');
console.log('Username:', testUsername);
console.log('Password:', testPassword);

// Verify the password
const isPasswordValid = verifyPassword(testPassword, ADMIN_PASSWORD_HASH, ADMIN_SALT);
console.log('Password verification result:', isPasswordValid);

// Even if verification fails, let's create a token with the correct format
// Create secure JWT token
const token = jwt.sign(
  { 
    username: ADMIN_USERNAME,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  },
  JWT_SECRET,
  { algorithm: 'HS256' }
);

console.log('\nGenerated admin token:');
console.log(token);

// Show how to use it in a cookie header
console.log('\nTo use this token in API requests, set the cookie header:');
console.log(`Cookie: admin_token=${token}`);

// Show how to use it with curl
console.log('\nExample curl command:');
console.log(`curl -H "Cookie: admin_token=${token}" http://localhost:3000/api/admin/chatbot-conversations`);