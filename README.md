<h1 align="center"> node-ssl-certificates </h1>
<p align="center">
  <b >a node.js library for fetching and parsing ssl-certificates</b>
</p>

<hr/>

[![npm](https://img.shields.io/badge/npm-v0.6.0-green.svg)](https://www.npmjs.com/package/node-ssl-certificates)
---

## Description
node-ssl-certificates is a node.js library for fetching and parsing ssl-certificates, resulting from merging others packages like

* [get-ssl-certificate](https://www.npmjs.com/package/get-ssl-certificate)  
* [cert-info](https://www.npmjs.com/package/cert-info)  

## Features
  * zero third-party dependencies
  * async/await support
  * optional use of node's crypto module


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

### .getCertificateFromFile(path, options)

fetch the ssl-certificate from the domain name

#### args

- path: string
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| includeChain | includes chain's certificates | boolean | false |
| includeCertificates | includes the raw certificates string in the response object | boolean | false |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |

## License

MIT

