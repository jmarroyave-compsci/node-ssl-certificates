const crypto = require("crypto");
const CONFIG = require("./test/config");
const certificates = require("./index");

async function main() {
  //await certs();
  //await parser();
  await printRaw();
}

async function parser() {
  const cert = await certificates.get(CONFIG.DOMAIN, {
    includeCertificates: false,
    useCryptoModule: false,
  });

  console.log(cert);
}


async function printRaw() {
  console.log(await certificates.print(CONFIG.DOMAIN));
}

async function certs() {
  const cert = await certificates.validate(CONFIG.DOMAIN, {
    includeCertificates: true,
    includeChain: true,
    useCryptoModule: true,
  });

  console.log(cert);
}

main().then(() => {});
