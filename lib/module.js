// author: jmarroyave
"use strict";

const certificate = require("./certificate");


async function printRawCertificate(cert) {
  certificate.printRaw(cert);
}

async function getCertificateFromURL(url, options = {}) {
  const parsedUrl = require("url").parse(url);
  options.port = parsedUrl.port || undefined;
  return await getCertificateFromDomain(parsedUrl.hostname, options);
}

async function getCertificateFromDomain(domain, options = {}) {
  const cert = await require("./fetch").fromConnection(domain, options);
  return await certificate.getInfo(cert.pemEncoded, options);
}

async function getCertificateFromFile(path, options = {}) {
  const cert = require("fs").readFileSync(path, "ascii");
  return await certificate.getInfo(cert, options);
}

module.exports = {
  getCertificateFromURL: getCertificateFromURL,
  getCertificateFromDomain: getCertificateFromDomain,
  getCertificateFromFile: getCertificateFromFile,
  printRawCertificate: printRawCertificate,
};
