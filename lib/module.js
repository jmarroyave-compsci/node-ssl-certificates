// author: jmarroyave
"use strict";
const certificate = require("./certificate");

async function print(from, options={}) {
  const { verbose=false } = options

  if(verbose) console.log(" >", "print")

  const pem = await getPEM(from, options)
  return await certificate.print(pem, options);
}

async function validate(from, options={}) {
  const { verbose=false } = options

  if(verbose) console.log(" >", "validate")
    
  const pem = await getPEM(from, options)
  return certificate.validate(pem, options)  
}

async function get(from, options = {}) {
  const { verbose=false } = options

  if(verbose) console.log(" >", "get")
    
  const pem = await getPEM(from, options)
  return await certificate.getInfo(pem, options);
}

async function getPEM( from, options={} ){
  const { verbose=false } = options
  var resp, cert;

  if(verbose) console.log("", " >", "getPEM")
    
  const source = getSource( from, options )

  switch( source.type ){
    case "URL":
      const { URL } = require('url')
      const url = new URL(source.value);
      cert = await require("./fetch").fromConnection(url.hostname, options);
      resp = cert.pemEncoded
      break;
    case "DOMAIN":
      cert = await require("./fetch").fromConnection(source.value, options);
      resp = cert.pemEncoded
      break;
    case "FILE":
      cert = require("fs").readFileSync(source.value, "ascii");
      resp = cert
      break;
  }

  if(verbose) console.log("", " >", "getPEM", resp.length)

  return resp;
}

function getSource( input, options={} ){
  const { verbose=false } = options
  const validator = require("./utils/validator");
  const resp = { type: null, value: input }

  if(verbose) console.log("", "", " >", "getSource", `[${input}]`)

  if( validator.isURL(input) ){
    resp.type = "URL"
  } else if( validator.isDNS(input) ){
    resp.type = "DOMAIN"
  } else if( validator.isLocalFile(input) ){
    resp.type = "FILE"
  } else {
    throw new Error("unknown input")
  }

  if(verbose) console.log("", "", " >", "getSource", resp.type)

  return resp
}

module.exports = {
  get: get,
  print: print,
  validate: validate,
};