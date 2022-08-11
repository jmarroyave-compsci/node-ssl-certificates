/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");
const helper = require("./helper");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("print functions", () => {
  describe("print raw certificate", () => {
    it("should print the certificate's info", async () => {
      const certificates = require("../index");
      const path = `${__dirname}/${CONFIG.PATHS.test_certificate}`
      const data = await certificates.print(path , { verbose: CONFIG.VERBOSE });
      expect(helper.getHash(data)).to.equal(CONFIG.CERT_HASH4);
    });
  });
});
