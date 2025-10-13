const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

// Generate a self-signed certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  algorithm: 'sha256',
  days: 365,
  keySize: 2048,
  extensions: [{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    timeStamping: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2,
      value: 'localhost'
    }, {
      type: 7,
      ip: '127.0.0.1'
    }]
  }]
});

// Write the certificate and key to files
fs.writeFileSync(path.join(__dirname, 'localhost.pem'), pems.cert);
fs.writeFileSync(path.join(__dirname, 'localhost-key.pem'), pems.private);

console.log('Self-signed certificate generated successfully!');
console.log('Certificate: localhost.pem');
console.log('Private Key: localhost-key.pem');