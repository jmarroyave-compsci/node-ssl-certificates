// author: jmarroyave
"use strict";

const https = require("https");
const pem = require("../pem");

function fromConnection(domain, options = {}) {
  const {port = 443, timeout = false, protocol = "https:"} = options;

  options = {
    hostname: domain,
    agent: false,
    rejectUnauthorized: false,
    ciphers: "ALL",
    port,
    protocol,
  };

  return new Promise(function(resolve, reject) {
    const req = handleRequestFromConnection(options, resolve, reject);

    if (timeout) {
      req.setTimeout(timeout, function() {
        reject(new Error("Request timed out."));
        req.abort();
      });
    }

    req.on("error", function(e) {
      reject(e);
    });

    req.end();
  });
}

function handleRequestFromConnection(options, resolve, reject) {
  return https.get(options, function(res) {
    const certificate = res.socket.getPeerCertificate();

    if (certificate === null) {
      reject({message: "The website did not provide a certificate"});
    } else {
      if (certificate.raw) {
        certificate.pemEncoded = pem.fromDER(certificate.raw);
      }
      resolve(certificate.pemEncoded);
    }
  });
}


async function fromURL(uri) {
  const der = await handleRequestFromURL(uri);
  return pem.fromDER(der);
}

const handleRequestFromURL = (url) => {
  return new Promise((resolve, reject) => {
    require("http")
        .get(url, (res) => {
          const rawData = [];
          res.on("data", (chunk) => rawData.push(chunk));
          res.on("end", () => resolve(Buffer.concat(rawData)));
        })
        .on("error", (e) => {
          reject(e);
        });
  });
};

module.exports = {
  fromConnection: fromConnection,
  fromURL: fromURL,
};
