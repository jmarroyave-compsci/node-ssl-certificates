/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");
const helper = require("./helper");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("validation functions", () => {
  describe("validate a certificate from domain name", () => {
    it("invalid PEM", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(
        `${__dirname}/data/x-01-test.cert.pem`, { verbose: CONFIG.VERBOSE }        
      );
      expect(data).to.be.equal(false);
    });
    it("invalid domain", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(CONFIG.CERT.DOMAIN, { domain: `${CONFIG.CERT.DOMAIN.slice(1)}`, verbose: CONFIG.VERBOSE, includeChain: true });
      expect(data).to.be.equal(false);
    });
    it("exact subject CN", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(CONFIG.CERT.DOMAIN, { domain: `*.${CONFIG.CERT.DOMAIN}`, verbose: CONFIG.VERBOSE, includeChain: true });
      expect(data).to.be.equal(true);
    });
    it("exact altname", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(CONFIG.CERT.DOMAIN, { domain: `${CONFIG.CERT.DOMAIN}`, verbose: CONFIG.VERBOSE, includeChain: true });
      expect(data).to.be.equal(true);
    });
    it("match * altname", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(CONFIG.CERT.DOMAIN, { domain: `test.${CONFIG.CERT.DOMAIN}`, verbose: CONFIG.VERBOSE, includeChain: true });
      expect(data).to.be.equal(true);
    });
    it("should be valid", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(CONFIG.CERT.DOMAIN, { verbose: CONFIG.VERBOSE, includeChain: true });
      expect(data).to.be.equal(true);
    });
  });
});
