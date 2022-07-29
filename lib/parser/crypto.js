"use strict";

function getCertificateInfo(cert, options = {}) {
  const {includeCertificates = false} = options;
  const crypto = require("crypto");
  const info = new crypto.X509Certificate(cert);
  const resp = {};

  const asObject = (str, sep) => {
    if (!str) return null;
    return str
        .split("\n")
        .filter((a) => a.trim() != "")
        .map((m) => m.split(sep))
        .reduce((tot, a) => {
          tot[a[0]] = a[1];
          return tot;
        }, {});
  };

  resp.subject = asObject(info.subject, "=");
  resp.subjectAltName = info.subjectAltName?.split(",").map((m) => m) ?? null;
  resp.issuer = asObject(info.issuer, "=");
  resp.infoAccess = asObject(info.infoAccess, " - ");
  resp.validFrom = new Date(info.validFrom);
  resp.validTo = new Date(info.validTo);
  resp.fingerprint = info.fingerprint;
  resp.fingerprint256 = info.fingerprint256;
  resp.fingerprint512 = info.fingerprint512;
  resp.keyUsage = info.keyUsage;
  resp.serialNumber = info.serialNumber;

  if (includeCertificates) {
    resp.certificate = {
      raw: cert,
      hash: require("crypto").createHash("md5").update(cert).digest("hex"),
    };
  }

  return resp;
}

module.exports = {
  getCertificateInfo : getCertificateInfo,
}