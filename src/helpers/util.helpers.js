const crypto = require('crypto');
const config = require('../config.json');

module.exports = {
  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4();
  },

  encrypt(text, password){
    var cipher = crypto.createCipher(config.algorithm, password + config.secret)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  },
 
  decrypt(text, password){
    var decipher = crypto.createDecipher(config.algorithm, password + config.secret)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  },

  isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }
}