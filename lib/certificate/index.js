// author: jmarroyave
"use strict";

const parser = require("../parser");
const fetch = require("../fetch");

async function print(pem, options={}) {
  return await parser.print(pem, options);
}

async function validate(pem, options={}) {
  const crypto = require("crypto");

  const { verbose=false } = options
  var resp

  if(verbose) console.log("", " >", "validating")

  const isPEMValid = () => {
    const type = "CERTIFICATE"
    const lex = { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
    return ( pem.startsWith(lex.start) && pem.endsWith(lex.end) )
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

  resp = isPEMValid(pem)
  if(verbose) console.log("", "", " >", "pem format:", (resp === true) ? "OK" : "Failed")
  if(resp === false) return false

  resp = true
  var cert
  try{
    cert = await getInfo(pem, { ...options, includeCertificates: true, verbose: false })  
  } catch(ex) {
    resp = false
  }
  if(verbose) console.log("", "", " >", "pem content:", (resp === true) ? "OK" : "Failed")
  if(resp === false) return false

  resp = null
  if( options.includeChain === true ){
    if(verbose) console.log("", "", " >", "verifying chain")
    if(verbose) console.log("", "", "", " >", "chain length ", cert.chain.length)
    cert.chain.unshift(cert)

    resp = true
    for( var i = 0; i < cert.chain.length - 1; i++ ){
      const testCert = cert.chain[i].certificate.raw
      const signedByKey = extractPublicKey(cert.chain[i+1].certificate.raw) 
      const x509 = new crypto.X509Certificate(testCert)
      const verified = x509.verify(signedByKey)
      //console.log(cert.chain[i].subject, cert.chain[i+1].subject)
      if(verbose) console.log("", "", "", " >", `[${printSubject(cert.chain[i])}]`, "verified by:", `[${printSubject(cert.chain[i+1])}]` , (resp === true) ? "OK" : "Failed")
      if(!verified){
        resp = false
      }
    }
  }  
  if(verbose) console.log("", "", " >", "chain:", (resp === true) ? "OK" : (resp === false) ? "Failed" : "SKIPPED!!!")
  if(resp === false) return false
  
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
