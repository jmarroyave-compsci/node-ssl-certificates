function getHash(data) {
  const str = JSON.stringify(data);
  const crypto = require("crypto");
  const md5sum = crypto.createHash("md5");
  md5sum.update(str);
  return md5sum.digest("hex");
}

module.exports = {
  getHash,
};
