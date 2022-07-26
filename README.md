
* [x] Parses x.509 certificate schemas
  * [x] DER/ASN.1
  * [x] PEM (base64-encoded DER)
  * [x] Subject
  * [x] SAN extension (altNames)
  * [x] Issuance Date (notBefore)
  * [x] Expiry Date (notAfter)
* [x] VanillaJS, **Zero Dependencies**
  * [x] Node.js
  * [ ] Browsers (built, publishing soon)


https://www.npmjs.com/package/get-ssl-certificate



# node-ssl-certificates

## A zero-dependency utility that returns a website's SSL certificate

inspired in

*[https://www.npmjs.com/package/get-ssl-certificate]


[![Build Status](https://travis-ci.org/jmarroyave-compsci/node-ssl-certificates.svg?branch=master)](https://travis-ci.org/jmarroyave-compsci/node-ssl-certificates)
[![Coverage Status](https://coveralls.io/repos/github/jmarroyave-compsci/node-ssl-certificates/badge.svg?branch=master)](https://coveralls.io/github/jmarroyave-compsci/node-ssl-certificates?branch=master)
[![Code Climate](https://codeclimate.com/github/jmarroyave-compsci/node-ssl-certificates/badges/gpa.svg)](https://codeclimate.com/github/jmarroyave-compsci/node-ssl-certificates)
[![npm](https://img.shields.io/badge/npm-v2.3.3-blue.svg)](https://www.npmjs.com/package/node-ssl-certificates)

### Installation

```
npm install --save node-ssl-certificates
```

### Usage

#### Import package:

```
const sslCertificates = require('node-ssl-certificates')
```

#### Pass a url / domain name:

```
sslCertificates.getCertificateFromDomain('nodejs.org').then(function (certificate) {
  console.log(certificate)
  // certificate is a JavaScript object

  console.log(certificate.issuer)
  // { C: 'GB',
  //   ST: 'Greater Manchester',
  //   L: 'Salford',
  //   O: 'COMODO CA Limited',
  //   CN: 'COMODO RSA Domain Validation Secure Server CA' }

  console.log(certificate.valid_from)
  // 'Aug  14 00:00:00 2017 GMT'

  console.log(certificate.valid_to)
  // 'Nov 20 23:59:59 2019 GMT'

  console.log(certificate.valid_to)

  // If there was a certificate.raw attribute, then you can access certificate.pemEncoded
  console.log(certificate.pemEncoded)
  // -----BEGIN CERTIFICATE-----
  // ...
  // -----END CERTIFICATE-----

});
```

## License

MIT
