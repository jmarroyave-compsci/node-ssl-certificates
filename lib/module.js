// author: jmarroyave
"use strict";
const certificate = require("./certificate");
const { get: getPEM } = require("./pem");
const console = require("./utils/console");

async function print(from, options={}) {
  const { verbose=false } = options

  console.breadcrumbs.push("print")

  const source = await getPEM(from, options)
  return await certificate.print(source.pem, options);
}

async function signedBy(from, signer, options={}) {
  const { verbose=false } = options

  if(verbose) console.log(" >", "signedBy")

  const fromSource = await getPEM(from, options)
  const signerSource = await getPEM(signer, options)

  return await certificate.signedBy(
    await certificate.getInfo(fromSource.pem, { includeCertificates : true } ), 
    await certificate.getInfo(signerSource.pem, { includeCertificates : true })
  )
}

async function validate(from, options={}) {
  const { verbose=false } = options

  if(verbose) console.log(" >", "validate")
    
  const source = await getPEM(from, options)
  
  if(!options.domain && source.type == "DOMAIN"){
    options.domain = from
  }

  return certificate.validate(source.pem, options)  
}

async function get(from, options = {}) {
  const { verbose=false } = options

  if(verbose) console.log(" >", "get")
    
  const source = await getPEM(from, options)
  return await certificate.getInfo(source.pem, options);
}

module.exports = {
  get: get,
  print: print,
  validate: validate,
  signedBy: signedBy,
};