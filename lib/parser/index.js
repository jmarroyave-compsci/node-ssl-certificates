const console = require("../utils/console");

async function print(cert, options={}) {
  const { verbose=false } = options
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

  if(!cert.issuer.O) delete cert.issuer.O
  if(!cert.issuer.CN) delete cert.issuer.CN
  if(!cert.subjectAltName) delete cert.subjectAltName
  if(!cert.keyUsage) delete cert.keyUsage
  if(cert.infoAccess && !cert.infoAccess['CA Issuers']) delete cert.infoAccess['CA Issuers']
  if(cert.infoAccess && !cert.infoAccess['OCSP']) delete cert.infoAccess['OCSP']
  if(!cert.infoAccess || Object.keys(cert?.infoAccess).length == 0) delete cert.infoAccess



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
