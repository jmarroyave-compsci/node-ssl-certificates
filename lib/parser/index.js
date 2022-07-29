
function getCertificateInfo(cert, options = {}) {
  const { useCryptoModule=true } = options

  if(useNodeParser){
    return require("./crypto").getCertificateInfo(cert)
  } else{
    return require("./cert-info").getCertificateInfo(cert)
  }
}

module.exports = {
  getCertificateInfo : getCertificateInfo,
}