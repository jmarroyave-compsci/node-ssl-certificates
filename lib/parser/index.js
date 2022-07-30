
function printRaw(cert) {
  require("./cert-info").printRaw(cert);
}

function getCertificateInfo(pem, options = {}) {
  const {useCryptoModule=true, includeCertificates=false} = options;

  let cert;
  if (useCryptoModule) {
    cert = require("./crypto").getCertificateInfo(pem, options);
  } else {
    cert = require("./cert-info").getCertificateInfo(pem, options);
  }

  if (includeCertificates) {
    cert.certificate = {
      raw: pem,
      hash: require("crypto").createHash("md5").update(pem).digest("hex"),
    };
  }

  return cert;
}

module.exports = {
  getCertificateInfo: getCertificateInfo,
  printRaw: printRaw,
};
