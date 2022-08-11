// author: jmarroyave
"use strict";

async function get( from, options={} ){
  const { get: getSource } = require("../utils/source");
  const { verbose=false } = options
  var resp, cert;

  if(verbose) console.breadcrumbs.push("getPEM")
    
  const source = getSource( from, options )

  switch( source.type ){
    case "URL":
      const { URL } = require('url')
      const url = new URL(source.value);
      cert = await require("../fetch").fromURL(from, options);
      resp = cert
      break;
    case "DOMAIN":
      cert = await require("../fetch").fromConnection(source.value, options);
      resp = cert
      break;
    case "FILE":
      const fs = require("fs")

      if(source.value.endsWith("pem")){
        cert = fs.readFileSync(source.value, "utf8");  
        resp = cert
      } else if(source.value.endsWith("der")){
        cert = fs.readFileSync(source.value);
        resp = fromDER(cert)
      } else {
        cert = fs.readFileSync(source.value, "utf8");  
        resp = cert        
      }
      
      break;
  }

  if(verbose) console.breadcrumbs.print(resp.length)
  console.breadcrumbs.pop()

  source.pem = resp;
  return source;
}


function encode(str) {
  const prefix = "-----BEGIN CERTIFICATE-----\n";
  const postfix = "-----END CERTIFICATE-----";
  const pemText =
    prefix +
    str
        .toString("base64")
        .match(/.{0,64}/g)
        .join("\n") +
    postfix;
  return pemText;
}

function fromDER( der ){
  return encode(der)
}

function fromString( data ){
  if(data.startsWith("----")){
    return data
  } else {
    return fromDER( Buffer.from(data) )    
  }
}

module.exports = {
  get: get,
  fromDER: fromDER,
  fromString: fromString,
};
