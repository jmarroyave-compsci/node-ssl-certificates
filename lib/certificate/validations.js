// author: jmarroyave
"use strict";

const console = require("../utils/console");
const certVerbose = require("./verbose");

const isPEMValid = ( pem ) => {
  const type = "CERTIFICATE"
  const lex = { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
  return ( pem.startsWith(lex.start) && pem.endsWith(lex.end) )
}

const isDateValid = (cert, date, verbose) => {
  const resp = date >= cert.validFrom && date <= cert.validTo
  if(verbose) console.breadcrumbs.print(`date valid [${date.toISOString()}]:`, (resp === true) ? "OK" : "Failed")
  return resp
}

const isDomainValid = (cert, domain, verbose) => {
  var resp = false
  
  console.breadcrumbs.push(`validate domain [${domain}]`)

  const domainWildcard = "*." + domain.split(".").slice(1).join(".")

  if( cert.subject.CN == domain || cert.subject.CN == `*.${domain}` ){
    if(verbose) console.breadcrumbs.print(`exact subject name`, "OK")
    resp = true
  } else if( cert.subjectAltName.includes(`DNS:${domain}`) || cert.subjectAltName.includes(`DNS:${domainWildcard}`) ){
    if(verbose) console.breadcrumbs.print(`exact subject altName`, "OK")
    resp = true
  }
  
  if(verbose) console.breadcrumbs.print((resp === true) ? "OK" : "Failed")
  console.breadcrumbs.pop()

  return resp
}

const isRootCAValid = (rootCA) => {
  return true
}

const isCertRevoked = (rootCA) => {
  return false
}

const areCryptoDetailsValid = (rootCA) => {
  // Do the cryptographic details match, key and algorithms?
  return true
}

const isChainValid = (chain, date, verbose) => {
    var resp = true
    for( var i = 0; i < chain.length - 1; i++ ){
      if(isDateValid(chain[i+1], date) === false) return false

      const verified = signedBy( chain[i], chain[i+1] )

      if(verbose) console.breadcrumbs.print(`[${certVerbose.subject(chain[i])}]`, "verified by:", `[${certVerbose.subject(chain[i+1])}]` , (resp === true) ? "OK" : "Failed")
      if(!verified){
        resp = false
      }
    }

    return resp;
}

const signedBy = ( cert, issuer ) => {
  const crypto = require("crypto");
  const testCert = cert.certificate.raw
  const signedByKey = extractPublicKey(issuer.certificate.raw) 
  const x509 = new crypto.X509Certificate(testCert)
  return x509.verify(signedByKey)
}

const extractPublicKey = (pem) => {
  const crypto = require("crypto");
  return crypto.createPublicKey(pem);
}


module.exports = {
  isRootCAValid: isRootCAValid,
  isDateValid: isDateValid,
  isDomainValid: isDomainValid,
  isPEMValid: isPEMValid,
  isChainValid: isChainValid,
  signedBy: signedBy,
  isCertRevoked: isCertRevoked,
  areCryptoDetailsValid: areCryptoDetailsValid,
};
