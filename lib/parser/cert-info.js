"use strict";

function getCertificateInfo(pem) {
  const ASN1 = require("./asn1/asn1");
  const Base64 = require("./asn1/base64");

  let c = Base64.unarmor(pem);
  c = ASN1.decode(c, 0);

  const resp = {};
  let n;

  n = c.sub[0];

  // 0:0 value 2
  // 1 variable-length value
  resp.serialNumber = n.sub[1].content().split("\n")[1];
  // 2:0 sha256 identifier 2:1 null
  // 3 certificate of issuer C/O/OU/CN
  resp.issuer = {
    C: n.sub[3].sub[0]?.sub[0].sub[1].content().split("\n")[0],
    ST: n.sub[3].sub[1]?.sub[0].sub[1].content().split("\n")[0],
    L: n.sub[3].sub[2]?.sub[0].sub[1].content().split("\n")[0],
    O: n.sub[3].sub[3]?.sub[0]?.sub[1].content().split("\n")[0],
    CN: n.sub[3].sub[4]?.sub[0].sub[1].content().split("\n")[0],
  };
  // 4:0 notBefore 4:1 notAfter
  resp.validFrom = new Date(n.sub[4].sub[0].content().split("\n")[0]);
  resp.validTo = new Date(n.sub[4].sub[1].content().split("\n")[0]);
  // 5 the client C/O/OU/CN, etc
  resp.subject = {
    CN: n.sub[5].sub[0].sub[0].sub[1].content().split("\n")[0],
  };
  // 6 public key
  // 7 extensions
  resp;
  resp.infoAccess = {
    "CA Issuers": n.sub[7].sub[0].sub[6]?.sub[1].sub[0].sub[0].sub[1].content().split("\n").map( c => `URI:${c}`).join("\n"),
    "OCSP": n.sub[7].sub[0].sub[6]?.sub[1].sub[0].sub[1].sub[1].content().split("\n").map( c => `URI:${c}`).join("\n"),
  };
  resp.subjectAltName = n.sub[7].sub[0].sub[7]?.sub[1].sub[0].sub.map( (x) => "DNS:" + x.content().split("\n")[1] );

  n = c.sub[1];
  return resp;
}


async function print(pem, options={}) {
  let response = "";
  const ASN1 = require("./asn1/asn1");
  const Base64 = require("./asn1/base64");

  let c = Base64.unarmor(pem);
  c = ASN1.decode(c, 0);

  const printAll = (r, idx=null, lvl=null ) => {
    lvl = (lvl != null) ? lvl + 1 : 0;
    idx = idx ?? 0;

    if (!r) return;

    const print = ( l, i, data="" ) => response += ["  ".repeat(l), ">", `${l}[${i}]`, ".".repeat(30 - (2 * l) - i.toString().length - l.toString().length), (data.trim) ? data.trim() : data].join(" ") + "\n";

    if (r.content) print(lvl, idx, r.content()?.replace(/\n/g, "||"));

    Object.keys( r ).forEach( (k, kdx) =>{
      switch (k) {
        case "sub":
          r[k]?.forEach( (rr, rrx) => {
            printAll( rr, rrx, lvl );
          });
          break;
        case "value":
          print( r[k], idx, lvl );
          break;
      }
    });
  };
  printAll(c);

  return response;
}

module.exports = {
  print: print,
  getCertificateInfo: getCertificateInfo,
};
