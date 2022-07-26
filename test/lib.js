
function getHash( data ){
  var str = JSON.stringify(data)
  var crypto = require('crypto');
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');  
}

module.exports = {
  getHash,  
}