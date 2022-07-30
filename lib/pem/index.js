// author: jmarroyave
"use strict";

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

module.exports = {
  encode: encode,
};
