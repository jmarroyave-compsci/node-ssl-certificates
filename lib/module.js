// author: jmarroyave
'use strict';

class Module{

    async getCertificateFromURL(url, options={}){
      const parsedUrl = require('url').parse(url)
      options.port = parsedUrl.port || undefined
      return await this.getCertificateFromDomain(parsedUrl.hostname, options)
    }

    async getCertificateFromDomain(domain, options={}){
      const cert = await require('./get/get').get(domain, options)
      return await this.getInfo(cert.pemEncoded, options )
    }

    async getCertificateFromFile(path, options={}){
      const cert = require('fs').readFileSync(path, 'ascii');
      return await this.getInfo(cert, options)
    }

    async getInfo(cert, options={}){
      const { includeChain=true } = options
      var info;
      try{
        info = this.getCertificateInfo(cert, options)

        if(includeChain){
          info.chain = await this.getChain(info)  
        }
      }catch(Ex){
        console.log(Ex)
      }

      return info
    }

    getCertificateInfo(cert){
      const crypto = require('crypto')
      const info = new crypto.X509Certificate(cert)
      const resp = {}

      const asObject = (str, sep) => {
        if(!str) return null
        return str.split("\n").filter(a => a.trim() != "" ).map( m => m.split(sep)).reduce( (tot, a) => {
          tot[a[0]] = a[1]
          return tot
        }, {})
      }

      resp.subject = asObject(info.subject, "=")
      resp.subjectAltName = info.subjectAltName?.split(",").map( m => m ) ?? null
      resp.issuer = asObject(info.issuer, "=")
      resp.infoAccess = asObject(info.infoAccess, " - ")
      resp.validFrom = info.validFrom
      resp.validTo = info.validTo
      resp.fingerprint = info.fingerprint
      resp.fingerprint256 = info.fingerprint256
      resp.fingerprint512 = info.fingerprint512
      resp.keyUsage = info.keyUsage
      resp.serialNumber = info.serialNumber

      return resp 
    }

    async getChain(cert){
      var chain = []
      var infoAccess;
      var data = cert
      var indent = " "
      while(true){
        //console.log(indent.repeat(chain.length), ">", data.issuer.CN)
        const CAIssuers = data.infoAccess?.['CA Issuers']?.replace("URI:", "")
        //console.log(indent.repeat(chain.length), ">", "CA Issuers:", data.infoAccess)
        if(!CAIssuers) break;
        var data = await require('./get/get').getCertSync(CAIssuers)
        data = this.getCertificateInfo(data)
        chain.push(data)
      }

      return chain
    }
}

module.exports = new Module()