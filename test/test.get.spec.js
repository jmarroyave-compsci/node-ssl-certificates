/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");
const helper = require("./helper");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("get functions", () => {
  describe("fetch a certificate from domain name", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.get(CONFIG.DOMAIN);
      expect(data?.subject?.CN).to.contain(CONFIG.DOMAIN);
    });
  });
  describe("includeCertificate", () => {
    it("should return the certificate's info with it's raw string", async () => {
      const certificates = require("../index");
      const data = await certificates.get(CONFIG.DOMAIN, {
        includeCertificates: true,
      });

      expect(data.certificate).to.be.an("object");
      expect(data.certificate.raw.length).to.be.greaterThan(0);
    });
  });
  describe("fetch a certificate from domain name with it's complete chain of trust", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");
      const data = await certificates.get(CONFIG.DOMAIN, {
        includeChain: true,
      });
      expect(data.chain).to.be.an("array");
      expect(data.chain.length).to.be.greaterThan(0);
    });
  });
});
