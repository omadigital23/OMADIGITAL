const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Use the actual values from .env.local
const JWT_SECRET = 'Djaq7TVxzmJYAVPzh0cqwqdEdQ5aYnZgiy2z9sC2uF1zM67+NyMgj2w99gEckqVemGvDjNzoCd1FBsC1fiMFNg==';
const ADMIN_USERNAME = 'admin_dca740c1';

// Create a valid JWT token
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

console.log('Valid JWT Token for admin access:');
console.log(token);
console.log('\nUse this token in the Authorization header as: Bearer ' + token);