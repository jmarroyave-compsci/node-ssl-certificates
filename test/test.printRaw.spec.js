/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");
const helper = require("./helper");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("printRaw", () => {
  describe("print raw certificate", () => {
    it("should return the certificate's info", async () => {
      const certificates = require("../index");

      let data = await certificates.getCertificateFromFile(
          `${__dirname}/${CONFIG.PATHS.test_certificate}`,
          {
            includeCertificates: true,
          },
      );

      data = certificates.printRawCertificate(data.certificate.raw);

      expect(helper.getHash(data)).to.equal(CONFIG.CERT_HASH4);
    });
  });
});
