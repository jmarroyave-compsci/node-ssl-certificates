<h1 align="center"> node-ssl-certificates </h1>
<p align="center">
  <b >a node.js library for fetching and parsing ssl-certificates</b>
</p>

<hr/>

[![npm version](https://img.shields.io/npm/v/node-ssl-certificates)]()
[![npm downloads](https://img.shields.io/npm/dt/node-ssl-certificates)]()
[![license](https://img.shields.io/npm/l/node-ssl-certificates)]()
[![dependencies](https://img.shields.io/librariesio/github/jmarroyave-compsci/node-ssl-certificates)]()
[![quality-all](https://img.shields.io/npms-io/quality-score/node-ssl-certificates?label=quality-all)]()
[![quality](https://img.shields.io/npms-io/quality-score/node-ssl-certificates)]()
[![popularity](https://img.shields.io/npms-io/popularity-score/node-ssl-certificates)]()
 

## Description
node-ssl-certificates is a node.js library for fetching and parsing ssl-certificates, resulting from merging others packages like

* [get-ssl-certificate](https://www.npmjs.com/package/get-ssl-certificate)  
* [cert-info](https://www.npmjs.com/package/cert-info)  
* [asn1js](https://www.npmjs.com/package/asn1js)  

## Features
  * zero third-party dependencies
  * async/await support
  * optional use of node's crypto module
  * asn1 viewer


## Installation

```
npm install --save node-ssl-certificates
```

## Usage

### node.js:

```
'use strict';
 
const sslCertificates = require('node-ssl-certificates')
 
sslCertificates.getCertificateFromDomain('nodejs.org').then(function (certificate) {
  console.log(certificate.issuer)
  // { 
  //   C: 'GB',
  //   ST: 'Greater Manchester',
  //   L: 'Salford',
  //   ....
  // }
});
```

## Methods

### .getCertificateFromURL(url, options)

fetch the ssl-certificate from the host included in the url

#### args

- url: string [p.e.: https://www.nodejs.com]
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| includeChain | includes chain's certificates | boolean | false |
| includeCertificates | includes the raw certificates string in the response object | boolean | false |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |
| port | port to connect to | int | 443 |

### .getCertificateFromDomain(domain, options)

fetch the ssl-certificate from the domain name

#### args

- domain: string [p.e.: nodejs.com]
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| includeChain | includes chain's certificates | boolean | false |
| includeCertificates | includes the raw certificates string in the response object | boolean | false |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |
| port | port to connect to | int | 443 |

### .getCertificateFromFile(pemPath, options)

fetch the ssl-certificate from the domain name

#### args

- pemPath: string
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| includeChain | includes chain's certificates | boolean | false |
| includeCertificates | includes the raw certificates string in the response object | boolean | false |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |

### .printRawCertificate(pem)

print the asn1 tree structure

#### args

- pem: string

#### return

- string: with the asn tree structure 

## License

MIT

