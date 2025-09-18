const crypto = require('crypto');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Test with the correct password and hash from the security document
const salt = 'e50c75a777960586f88ad2ace4f73d13974480e65fa0844a7bdd176ef384a98e';
const password = 'OMA_0b2b065744aa1557_2024!';

const hash = hashPassword(password, salt);

console.log('Password (OMA_0b2b065744aa1557_2024!):', hash);

const expectedHash = 'c5db023d5b36f27e9702be53a605312a979b1b02ee7134b528b2683829f8132b347a32cf6808c3f01b73b0cf0fd2633528511b931685aa34b3bfd360bf6b849f';

console.log('Expected hash matches password:', hash === expectedHash);

if (hash === expectedHash) {
  console.log('✅ SUCCESS: Password and hash match!');
} else {
  console.log('❌ ERROR: Password and hash do not match');
}