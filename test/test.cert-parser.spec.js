/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CONFIG = require("./config");
const helper = require("./helper");

// Load chai-as-promised support
chai.use(chaiAsPromised);

chai.should();

describe("cert-parser", () => {
  describe("fetch a certificate from file and parse it's info with own-parser", () => {
    it("leaf certificate", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.test_certificate}`
          , {
            useCryptoModule: false,
          },
      );
      expect(helper.getHash(data)).to.equal(CONFIG.CERT_HASH2);
    });
    it("root certificate", async () => {
      const certificates = require("../index");
      const data = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.root_certificate}`
          , {
            useCryptoModule: false,
          },
      );
      expect(helper.getHash(data)).to.equal("2f1fe810f9e0e55c936458a71b6b7fbd");
    });
  });

  describe("compare properties from both parsers", () => {
    it("should compare properties from parsers and expect an specific result", async () => {
      const certificates = require("../index");
      const data1 = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.test_certificate}`
          , {
            useCryptoModule: false,
          },
      );

      const data2 = await certificates.get(
          `${__dirname}/${CONFIG.PATHS.test_certificate}`
          , {
            useCryptoModule: true,
          },
      );

      const data3 = {};

      Object.keys( data2 ).forEach( (k) => {
        if (["crypto"].includes(k)) return;
        if (JSON.stringify(data1[k]) == JSON.stringify(data2[k])) return;
        if (data1[k]) {
          // console.log(k, data1[k], data2[k])
        }
        data3[k] = data2[k];
      });

      // console.log(data3)
      expect(helper.getHash(data3)).to.equal(CONFIG.CERT_HASH3);
    });
  });
});
