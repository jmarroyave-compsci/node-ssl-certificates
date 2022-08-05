// author: jmarroyave
"use strict";

const parser = require("../parser");
const fetch = require("../fetch");
const console = require("../utils/console");

async function print(pem, options={}) {
  return await parser.print(pem, options);
}

async function validate(pem, options={}) {
  const crypto = require("crypto");

  const { verbose=false } = options
  var resp
  const date = new Date()

  const isPEMValid = () => {
    const type = "CERTIFICATE"
    const lex = { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
    return ( pem.startsWith(lex.start) && pem.endsWith(lex.end) )
  }

  const isDateValid = (cert, date) => {
    const resp = date >= cert.validFrom && date <= cert.validTo
    if(verbose) console.breadcrumbs.print(`date valid [${printSubject(cert)}]:`, (resp === true) ? "OK" : "Failed")
    return resp
  }

  const isRootCAValid = (rootCA) => {
    return true
  }

  const extractPublicKey = (pem) => {
      return crypto.createPublicKey(pem);
  }

  const printSubject = ( cert ) => {
    var obj = null;
    var props = ["CN", "O", "OU"]

    for(const prop of props){
      if(cert.subject[prop]) {
        obj = prop  
        break;
      }
    }

    return (obj) ? cert.subject[obj].slice(0,20) : "???"
  }

  const verifySignature = ( cert, issuer ) => {
    const testCert = cert.certificate.raw
    const signedByKey = extractPublicKey(issuer.certificate.raw) 
    const x509 = new crypto.X509Certificate(testCert)
    return x509.verify(signedByKey)
  }

  if(verbose) console.line()
  if(verbose) console.log("validating".toUpperCase())
  if(verbose) console.line()
  if(verbose) console.breadcrumbs.print("current validation date:", date.toISOString())
  if(verbose) console.line()

  resp = isPEMValid(pem)
  if(verbose) console.breadcrumbs.print("pem format:", (resp === true) ? "OK" : "Failed")
  if(resp === false) return false

  resp = true
  var cert
  try{
    cert = await getInfo(pem, { ...options, includeCertificates: true, verbose: false })  
  } catch(ex) {
    resp = false
  }
  if(verbose) console.breadcrumbs.print("pem content:", (resp === true) ? "OK" : "Failed")
  if(resp === false) return false

if(isDateValid(cert, date) === false) return false

  resp = null
  if( options.includeChain === true ){
    if(verbose) console.breadcrumbs.push("verifying chain")
    if(verbose) console.breadcrumbs.print("chain length ", cert.chain.length)
    cert.chain.unshift(cert)
    const rootCA = cert.chain.slice(-1)[0]

    resp = true
    for( var i = 0; i < cert.chain.length - 1; i++ ){
      if(isDateValid(cert.chain[i+1], date) === false) return false

      const verified = verifySignature( cert.chain[i], cert.chain[i+1] )

      //console.log(cert.chain[i].subject, cert.chain[i+1].subject)
      if(verbose) console.breadcrumbs.print(`[${printSubject(cert.chain[i])}]`, "verified by:", `[${printSubject(cert.chain[i+1])}]` , (resp === true) ? "OK" : "Failed")
      if(!verified){
        resp = false
      }
    }

    resp = verifySignature(rootCA, rootCA)
    if(verbose) console.breadcrumbs.print(`Root CA, self signed? [${printSubject(rootCA)}]:`, (resp === true) ? "OK" : "Failed")
    //if(resp === false) return false

    resp = isRootCAValid(rootCA)
    if(verbose) console.breadcrumbs.print(`Root CA, in local repos? [${printSubject(rootCA)}]:`, (resp === true) ? "OK" : "Failed")
    //if(resp === false) return false
  }

  if(verbose) console.breadcrumbs.print("chain:", (resp === true) ? "OK" : (resp === false) ? "Failed" : "SKIPPED!!!")
  if(resp === false) return false
  if(verbose) console.breadcrumbs.pop()  
  
  return true
}

async function getInfo(cert, options = {}) {
  const {includeChain = false} = options;
  const info = parser.getCertificateInfo(cert, options);

  if (includeChain) {
    info.chain = await getChain(info, options);
  }

  return info;
}

async function getChain(cert, options = {}) {
  const {verbose} = options;
  const chain = [];
  const indent = " ";
  let data = cert;
  const loop = true;
  while (loop) {
    if (verbose) console.log(indent.repeat(chain.length), ">", data.issuer.CN);
    const CAIssuers = data.infoAccess?.["CA Issuers"]?.replace("URI:", "");
    if (!CAIssuers) break;
    data = await fetch.fromURL(CAIssuers);
    data = parser.getCertificateInfo(data, options);
    chain.push(data);
  }

  return chain;
}

module.exports = {
  getInfo: getInfo,
  print: print,
  validate: validate,
};
