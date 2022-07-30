/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("get certificate parameters", () => {
  describe("includeCertificate", () => {
    it("should return the certificate's info with it's raw string", async () => {
      const certificates = require("../index");
      const data = await certificates.getCertificateFromDomain(CONFIG.DOMAIN, {
        includeCertificates: true,
      });

      expect(data.certificate).to.be.an("object");
      expect(data.certificate.raw.length).to.be.greaterThan(0);
    });
  });
});
