const {  expect } = require('chai');
const crypto = require('../src/lib/crypto');

describe('hushnote tests', () => {
    it('should return a unique iv and secretKey', () => {
        const { iv, securityKey } = crypto.generateIVAndSecurityKey();
        expect(iv).to.not.be.null;
        expect(securityKey).to.not.be.null;
        expect(iv.length).to.eq(16);
        expect(securityKey.length).to.eq(32);
    });
    it('should encrypt a message', () => {
        const { iv, securityKey } = crypto.generateIVAndSecurityKey();
        expect(iv).to.not.be.null;
        expect(securityKey).to.not.be.null;
        const message = crypto.encrypt('Hello, world!', iv, securityKey);
        expect(message).to.not.be.null;
    });
    it('should decrypt a message', () => {
        const { iv, securityKey } = crypto.generateIVAndSecurityKey();
        expect(iv).to.not.be.null;
        expect(securityKey).to.not.be.null;
        const message = crypto.encrypt('Hello, world!', iv, securityKey);
        expect(message).to.not.be.null; 
        const decrypted = crypto.decrypt(message, iv, securityKey);
        expect(decrypted).to.eq('Hello, world!')
    });
});