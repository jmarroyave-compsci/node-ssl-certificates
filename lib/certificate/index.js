// author: jmarroyave
"use strict";

const parser = require("../parser");
const fetch = require("../fetch");

async function printRaw(cert) {
  parser.printRaw(cert);
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
  printRaw: printRaw,
};
