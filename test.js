const crypto = require("crypto");
const CONFIG = require("./test/config");
const certificates = require("./index");

async function main() {
  await certs();
  await parser();
  await printRaw();
}

async function parser() {
  const cert = await certificates.getCertificateFromDomain(CONFIG.DOMAIN, {
    includeCertificates: false,
    useCryptoModule: false,
  });

  console.log(cert);
}


async function printRaw() {
  const cert = await certificates.getCertificateFromDomain(CONFIG.DOMAIN, {
    includeCertificates: true,
    useCryptoModule: false,
  });

  console.log(certificates.printRawCertificate(cert.certificate.raw));
}

async function certs() {
  const cert = await certificates.getCertificateFromDomain(CONFIG.DOMAIN, {
    includeCertificates: true,
    includeChain: true,
    useCryptoModule: true,
  });

  console.log(cert);

  const key = crypto.createPublicKey(cert.certificate.raw).export({type: "spki", format: "pem"});

  console.log(key);
  console.log(cert.publicKey);

  console.log("chain:", cert.chain.length);
  console.log(cert.chain[0].subject.O, "verified:", cert.crypto.verify(cert.chain[0].publicKey));
  console.log(cert.chain[1].subject.O, "verified:", cert.chain[0].crypto.verify(cert.chain[1].publicKey));
}

main().then(() => {});
