// author: jmarroyave
"use strict";

const https = require("https");

function pemEncode(str) {
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

function getCertFromConnection(domain, options = {}) {
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
        certificate.pemEncoded = pemEncode(
            certificate.raw.toString("base64"),
            64,
        );
      }
      resolve(certificate);
    }
  });
}


async function getCertFromFile(uri) {
  const body = await handleRequestFromFile(uri);
  return pemEncode(body);
}

const handleRequestFromFile = (url) => {
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
  getCertFromConnection: getCertFromConnection,
  getCertFromFile: getCertFromFile,
};
