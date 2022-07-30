/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("chain parameters", () => {
  describe("fetch a certificate from domain name with it's complete chain of trust", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.getCertificateFromDomain(CONFIG.DOMAIN, {
        includeChain: true,
      });
      expect(data.chain).to.be.an("array");
      expect(data.chain.length).to.be.greaterThan(0);
    });
  });
});
