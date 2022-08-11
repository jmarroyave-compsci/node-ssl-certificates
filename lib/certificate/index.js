// author: jmarroyave
"use strict";

const parser = require("../parser");
const fetch = require("../fetch");
const console = require("../utils/console");
const certValidations = require("./validations");
const certVerbose = require("./verbose");

async function print(pem, options={}) {
  return await parser.print(pem, options);
}

async function validate(pem, options={}) {
  const crypto = require("crypto");

  const { verbose=false, domain=null } = options, date = new Date();
  var resp, cert;

  if(verbose) console.line()
  if(verbose) console.log("validating".toUpperCase())
  if(verbose) console.line()
  if(verbose) console.breadcrumbs.print("current validation date:", date.toISOString())
  if(verbose) console.line()

  resp = certValidations.isPEMValid(pem)
  if(verbose) console.breadcrumbs.print("pem format:", (resp === true) ? "OK" : "Failed")
  if(resp === false) return false

  resp = true
  try{
    cert = await getInfo(pem, { ...options, includeCertificates: true, verbose: false })  
  } catch(ex) {
    resp = false
  }
  if(verbose) console.breadcrumbs.print("pem content:", (resp === true) ? "OK" : "Failed")
  if(resp === false) return false

  if( certValidations.isDateValid(cert, date, verbose) === false) return false

  if( certValidations.isCertRevoked(cert, verbose) === true ) return false

  if( certValidations.areCryptoDetailsValid(cert, verbose) === false) return false

  if( domain && certValidations.isDomainValid(cert, domain, verbose) === false) return false

  resp = null
  if( options.includeChain === true ){
    if(verbose) console.breadcrumbs.push("verifying chain")
    if(verbose) console.breadcrumbs.print("chain length ", cert.chain.length)
    cert.chain.unshift(cert)
    const rootCA = cert.chain.slice(-1)[0]

    resp = certValidations.isChainValid(cert.chain, date, verbose)

    resp = certValidations.signedBy(rootCA, rootCA)
    if(verbose) console.breadcrumbs.print(`Root CA, self signed? [${certVerbose.subject(rootCA)}]:`, (resp === true) ? "OK" : "Failed")
    //if(resp === false) return false

    resp = certValidations.isRootCAValid(rootCA)
    if(verbose) console.breadcrumbs.print(`Root CA, in local repos? [${certVerbose.subject(rootCA)}]:`, (resp === true) ? "OK" : "Failed")
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
  signedBy : certValidations.signedBy,
};
