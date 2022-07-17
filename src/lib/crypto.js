const crypto = require('crypto');

module.exports = {

    generateIVAndSecurityKey() {
        const iv = crypto.randomBytes(8).toString('hex');
        const securityKey = crypto.randomBytes(16).toString('hex');
        return { iv, securityKey };
    },

    encrypt(text, iv, securityKey) {
        iv = Buffer.from(iv);
        securityKey = Buffer.from(securityKey);
        const cipher = crypto.createCipheriv(process.env.ALGORITHM || 'aes-256-cbc', securityKey, iv)
        let crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt(text, iv, securityKey) {
        iv = Buffer.from(iv);
        securityKey = Buffer.from(securityKey);
        const cipher = crypto.createDecipheriv(process.env.ALGORITHM || 'aes-256-cbc', securityKey, iv);
        let decrypted = cipher.update(text, 'hex', 'utf8');

        decrypted += cipher.final('utf8');
        return decrypted;
    },

    isASCII(str) {
        return /^[\x00-\x7F]*$/.test(str);
    },
}