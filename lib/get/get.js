// author: jmarroyave
'use strict';


var https = require('https');

function isEmpty(object) {
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) return false;
  }

  return true;
}

function pemEncode(str, n) {
  var ret = [];

  for (var i = 1; i <= str.length; i++) {
    ret.push(str[i - 1]);
    var mod = i % n;

    if (mod === 0) {
      ret.push('\n');
    }
  }

  var returnString = `-----BEGIN CERTIFICATE-----\n${ret.join('')}\n-----END CERTIFICATE-----`;

  return returnString;
}

function getOptions(url, port, protocol) {
  return {
    hostname: url,
    agent: false,
    rejectUnauthorized: false,
    ciphers: 'ALL',
    port,
    protocol
  };
}

function validateUrl(url) {
  if (url.length <= 0 || typeof url !== 'string') {
    throw Error('A valid URL is required');
  }
}

function handleRequest(options, resolve, reject) {
  return https.get(options, function(res) {
    var certificate = res.socket.getPeerCertificate();

    if (isEmpty(certificate) || certificate === null) {
      reject({ message: 'The website did not provide a certificate' });
    } else {
      if (certificate.raw) {
        certificate.pemEncoded = pemEncode(certificate.raw.toString('base64'), 64);
      }
      resolve(certificate);
    }
  });
}

function get(domain, options={}) {
  const { port=443, timeout=false, protocol="https:"} = options
  validateUrl(domain);

  var options = getOptions(domain, port, protocol);

  return new Promise(function(resolve, reject) {
    var req = handleRequest(options, resolve, reject);

    if (timeout) {
      req.setTimeout(timeout, function() {
        reject({ message: 'Request timed out.' });
        req.abort();
      });
    }

    req.on('error', function(e) {
      reject(e);
    });

    req.end();
  });
}

async function getCertSync(uri){
  const body = await downloadNew(uri);
  require('fs').writeFileSync('./test.crt', body)

  var prefix = '-----BEGIN CERTIFICATE-----\n';
  var postfix = '-----END CERTIFICATE-----';
  var pemText = prefix + body.toString('base64').match(/.{0,64}/g).join('\n') + postfix;


  return pemText
}


const downloadNew = (url) => {
    return new Promise((resolve, reject) => {
      require('http').get(url, (res) => {
          let rawData = []
          res.on('data', chunk => rawData.push(chunk) );
          res.on('end', () => resolve(Buffer.concat(rawData)) );
      }).on('error', (e) => {
          reject(e)
      });

    }) 
}


module.exports = {
  get: get,
  getCertSync: getCertSync,
};
