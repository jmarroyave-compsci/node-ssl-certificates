// author: jmarroyave
"use strict";

const certInfo = require("./parser");
const DEBUG = false;

async function getCertificateFromURL(url, options = {}) {
  const parsedUrl = require("url").parse(url);
  options.port = parsedUrl.port || undefined;
  return await getCertificateFromDomain(parsedUrl.hostname, options);
}

async function getCertificateFromDomain(domain, options = {}) {
  const cert = await require("./get").getCertFromConnection(domain, options);
  return await getInfo(cert.pemEncoded, options);
}

async function getCertificateFromFile(path, options = {}) {
  const cert = require("fs").readFileSync(path, "ascii");
  return await getInfo(cert, options);
}

async function getInfo(cert, options = {}) {
  const {includeChain = false, printParse2 = false} = options;
  const info = certInfo.getCertificateInfo(cert, options);

  if (includeChain) {
    info.chain = await getChain(info, options);
  }

  if (printParse2) {
    info.cert2 = certInfo.getCertificateInfo2(cert, options);
  }

  return info;
}

async function getChain(cert, options = {}) {
  const chain = [];
  const indent = " ";
  let data = cert;
  const loop = true;
  while (loop) {
    if (DEBUG) console.log(indent.repeat(chain.length), ">", data.issuer.CN);
    const CAIssuers = data.infoAccess?.["CA Issuers"]?.replace("URI:", "");
    if (!CAIssuers) break;
    data = await require("./get").getCertFromFile(CAIssuers);
    data = certInfo.getCertificateInfo(data, options);
    chain.push(data);
  }

  return chain;
}

module.exports = {
  getCertificateFromURL: getCertificateFromURL,
  getCertificateFromDomain: getCertificateFromDomain,
  getCertificateFromFile: getCertificateFromFile,
};
