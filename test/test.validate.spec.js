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
    it("should be valid", async () => {
      const certificates = require("../index");
      const data = await certificates.validate(CONFIG.DOMAIN, { verbose: CONFIG.VERBOSE, includeChain: true });
      expect(data).to.be.equal(true);
    });
  });
});
