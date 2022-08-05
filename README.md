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
 

* [Description](#description)
* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [API Documentation](#api-documentation)
  * [get](#get)
  * [validate](#validate)
  * [print](#print)
* [Reference packages](#reference_packages)
* [License](#license)


## Description
node-ssl-certificates is a node.js library for common ssl-certificates tasks such as fetch, parse and validation. 

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
 
sslCertificates.get('nodejs.org').then(function (certificate) {
  console.log(certificate.issuer)
  // { 
  //   C: 'GB',
  //   ST: 'Greater Manchester',
  //   L: 'Salford',
  //   ....
  // }
});
```

## API Documentation

### get

fetch the ssl-certificate from a host, url or local file

```javascript
const { get } = require('node-ssl-certificates');

await get(from, options);
```

#### args

- from: string [ p.e.: https://www.nodejs.com, nodejs.com, /tmp/cert.pem ]
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| includeChain | includes chain's certificates | boolean | false |
| includeCertificates | includes the raw certificates string in the response object | boolean | false |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |
| port | port to connect to | int | 443 |

### validateCertificate

validates a ssl-certificate from a host, url or local file

```javascript
const { validate } = require('node-ssl-certificates');

await validate(from, options);
```

#### args

- from: string [ p.e.: https://www.nodejs.com, nodejs.com, /tmp/cert.pem ]
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| includeChain | includes chain's certificates | boolean | false |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |
| port | port to connect to | int | 443 |

### print

print the asn1 tree structure

```javascript
const { print } = require('node-ssl-certificates');

await printCertificate(from, options);
```

#### args

- from: string [ p.e.: https://www.nodejs.com, nodejs.com, /tmp/cert.pem ]
- options: object

| option| description | type | default |
| --- | ---- | ---- | ---- |
| useCryptoModule | use node's crypto module or custom parser | boolean | true |

#### return

- string: with the asn tree structure 

## Reference packages
  
thanks

* [get-ssl-certificate](https://www.npmjs.com/package/get-ssl-certificate)  
* [cert-info](https://www.npmjs.com/package/cert-info)  
* [asn1js](https://www.npmjs.com/package/asn1js)  


## License

The module is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).