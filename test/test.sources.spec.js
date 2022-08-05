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
      const data = await certificates.get(CONFIG.DOMAIN, { verbose: CONFIG.VERBOSE });
      expect(data?.subject?.CN).to.contain(CONFIG.DOMAIN);
    });
  });

  describe("fetch a certificate from a url", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          `https://${CONFIG.DOMAIN}/test/url`, { verbose: CONFIG.VERBOSE }
      );
      expect(data?.subject?.CN).to.contain(CONFIG.DOMAIN);
    });
  });

  describe("fetch a certificate from local file", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.test_certificate}`, { verbose: CONFIG.VERBOSE }
      );
      expect(helper.getHash(data)).to.equal(CONFIG.CERT_HASH);
    });
  });
});
