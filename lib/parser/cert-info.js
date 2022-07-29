// Copyright 2016-2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const certInfo = module.exports;

const ASN1 = require("./asn1-parser.js").ASN1;
const PEM = require("./asn1-parser.js").PEM;
const Enc = require("./asn1-parser.js").Enc;

Enc.hexToDate = function(hex) {
  let date = Buffer.from(hex, "hex");
  date = new Date(
      Date.UTC(
          "20" + date.slice(0, 2),
          date.slice(2, 4) - 1,
          date.slice(4, 6),
          date.slice(6, 8),
          date.slice(8, 10),
          date.slice(10, 12),
      ),
  );

  return date;
};

Enc.hexToBuf = function(hex) {
  if (!hex) return null;
  return Buffer.from(hex, "hex");
};

Enc.bufToUtf8 = function(u8) {
  if (!u8) return null;
  return Buffer.from(u8).toString("utf8");
};

Enc.hexToUtf8 = function(hex) {
  if (!hex) return null;
  return Enc.bufToUtf8(Enc.hexToBuf(hex));
};

certInfo.debug = certInfo.getCertInfo = function(pem) {
  const bytes = PEM.parseBlock(pem).bytes;
  return ASN1.parse(bytes);
};

certInfo.info = certInfo.getCertificateInfo = function(pem) {
  const resp = {};

  let c = certInfo.getCertInfo(pem);

  // A cert has 3 parts: cert, signature meta, signature
  if (c.children.length !== 3) {
    throw new Error(
        "doesn't look like a certificate: expected 3 parts of header",
    );
  }

  c = c.children[0];

  if (8 !== c.children.length) {
    throw new Error(
        "doesn't look like a certificate: expected 8 parts to certificate",
    );
  }

  // 0:0 value 2
  // 1 variable-length value
  resp.serialNumber = c.children[1].value.toString("hex").toUpperCase();
  // 2:0 sha256 identifier 2:1 null
  // 3 certificate of issuer C/O/OU/CN
  resp.issuer = {
    C: Enc.hexToUtf8(c.children[3].children[0].children[0].children[1].value),
    ST: Enc.hexToUtf8(c.children[3].children[1].children[0].children[1].value),
    L: Enc.hexToUtf8(c.children[3].children[2].children[0].children[1].value),
    O: Enc.hexToUtf8(c.children[3].children[3].children[0].children[1].value),
    CN: Enc.hexToUtf8(c.children[3].children[4].children[0].children[1].value),
  };
  // 4:0 notBefore 4:1 notAfter
  resp.validFrom = Enc.hexToDate(c.children[4].children[0].value);
  resp.validTo = Enc.hexToDate(c.children[4].children[1].value);
  // 5 the client C/O/OU/CN, etc
  resp.subject = {
    CN: c.children[5].children
        .map(function(set) {
          return Enc.bufToUtf8(set.children[0].children[1].value);
        })[0],
  };

  // 6 public key

  // 7 extensions

  resp.infoAccess = {
    "CA Issuers": Enc.hexToUtf8(c.children[7].children[0]?.children[6]?.children[1]?.children[0].children[0]?.children[1]?.value),
    "OCSP": Enc.hexToUtf8(c.children[7].children[0]?.children[6]?.children[1]?.children[0]?.children[1]?.children[1]?.value),
  };

  resp.subjectAltName = c.children[7].children[0].children
      .filter(function(seq) {
        if ("551d11" === Enc.bufToHex(seq.children[0].value)) {
          return true;
        }
      })
      .map(function(seq) {
        return seq?.children[1]?.children[0]?.children.map(function(name) {
          return "DNS:" + Enc.bufToUtf8(name.value);
        });
      })[0];


  // printAll(c)

  return resp;
};

/*

  const printAll = (r, l=0 ) => {
    // console.log(r)
    l = l + 1;
    if (!r) return;
    r?.children?.forEach( (ci, idx) => {
      console.log(" ".repeat(l), "L:", l, "IDX:", idx);
      if (ci.value) console.log(" ".repeat(l), Enc.bufToUtf8(ci.value), ci.value.toString("hex"));
      printAll(ci, l);
    });
  };

*/
