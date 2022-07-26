const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const CONFIG = require('./config');
const lib = require('./lib');

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe('basic functions', () => {

  describe('fetch a certificate from domain name', () => {
    it(`should return the certificate's info`, async () => {

      const certificates = require('../index')
      const data = await certificates.getCertificateFromDomain( CONFIG.DOMAIN )
      expect(lib.getHash(data)).to.equal(CONFIG.CERT_HASH);
    });
  });

  describe('fetch a certificate from a url', () => {
    it(`should return the certificate's info`, async () => {

      const certificates = require('../index')
      const data = await certificates.getCertificateFromURL( `https://${CONFIG.DOMAIN}/test/url` )
      expect(lib.getHash(data)).to.equal(CONFIG.CERT_HASH);
    });
  });
  
  describe('fetch a certificate from local file', () => {
    it(`should return the certificate's info`, async () => {
      const certificates = require('../index')
      const data = await certificates.getCertificateFromFile( `${__dirname}/${CONFIG.PATHS.test_certificate}` )
      expect(lib.getHash(data)).to.equal(CONFIG.CERT_HASH);
    });
  });
});