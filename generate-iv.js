const crypto = require('crypto');
const iv = crypto.randomBytes(16);

const ivString = iv.toString('hex').substr(0, 16);

console.log(`\nYour generated IV is: ${ivString}\n`);