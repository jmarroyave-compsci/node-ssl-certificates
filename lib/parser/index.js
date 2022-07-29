
function getCertificateInfo(cert, options = {}) {
  const {useCryptoModule=true} = options;

  if (useCryptoModule) {
    return require("./crypto").getCertificateInfo(cert, options);
  } else {
    return require("./cert-info").getCertificateInfo(cert, options);
  }
}

module.exports = {
  getCertificateInfo: getCertificateInfo,
};
