
async function print(cert, options={}) {
  return await require("./cert-info").print(cert, options);
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
  print: print,
};
