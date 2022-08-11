/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");
const helper = require("./helper");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("sources", () => {
  describe("fetch a certificate from domain name", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.get(CONFIG.CERT.DOMAIN, { verbose: CONFIG.VERBOSE });
      expect(data?.subject?.CN).to.contain(CONFIG.CERT.DOMAIN);
    });
  });

  describe("fetch a certificate from a url", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          CONFIG.CERT.ISSUER.AIA, { verbose: CONFIG.VERBOSE }
      );

      expect(data?.subject?.CN).to.contain(CONFIG.CERT.ISSUER.CN);
    });
  });

  describe("fetch a certificate from local file", () => {
    it("should return the certificate's info from PEM", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.test_certificate}`, { verbose: CONFIG.VERBOSE }
      );
      expect(helper.getHash(data)).to.equal(CONFIG.CERT_HASH);
    });
    it("should return the certificate's info from DER", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.root_certificate}`, { verbose: CONFIG.VERBOSE }
      );
      expect(helper.getHash(data)).to.equal("9964e531e8c5dad91c9b06e71d6f364f");
    });
  });
});
