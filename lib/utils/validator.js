// author: jmarroyave
"use strict";

const isURL = (s, protocols=["http", "https"]) => {
  const { URL } = require('url');
  try {
    const url = new URL(s);
    return protocols
        ? url.protocol
            ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
            : false
        : true;
  } catch (err) {
    return false;
  }
};

const isDNS = (s) => {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(s)
}

const isLocalFile = (s) => {
  const fs = require('fs');
  if(fs.existsSync(s)){
    return true
  } 

  return false
};

module.exports = {
  isURL: isURL,
  isDNS: isDNS,
  isLocalFile: isLocalFile,
};