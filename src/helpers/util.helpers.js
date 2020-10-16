const crypto = require('crypto');

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
    var cipher = crypto.createCipheriv(process.env.ALGORITHM, password + process.env.SECRET)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
  },
 
  decrypt(text, password){
    var decipher = crypto.createCipheriv(process.env.ALGORITHM, password + process.env.SECRET)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
  },

  isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }
}