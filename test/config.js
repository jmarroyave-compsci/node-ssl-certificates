const DOMAIN = "nodejs.org";
// const DOMAIN = "google.com"

module.exports = {
  VERBOSE: true,
  PATHS: {
    test_certificate: "./data/test.cert.pem",
    root_certificate: "./data/test.root.cert.der",
  },
  CERT: {
    DOMAIN: DOMAIN,
    ISSUER: {
      CN : "Sectigo RSA Domain Validation Secure Server CA",
      AIA: "http://crt.sectigo.com/SectigoRSADomainValidationSecureServerCA.crt",
    },
  },
  CERT_HASH: "b771f111d55eb53e65c92f7ca77f382e",
  CERT_HASH2: "683eaaa9815fe043aabc073b569b4950",
  CERT_HASH3: "c61f95dac32fb2ab2aa14eb2cc56bd75",
  CERT_HASH4: "bb7241586f6ebfdb6712ddf56ade87a1",
};
