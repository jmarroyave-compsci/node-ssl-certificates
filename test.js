const crypto = require("crypto");
const CONFIG = require("./test/config");
const certificates = require("./index");

async function main() {
  await validate();
  //await get();
  //await printRaw();
}

async function get() {
  const cert = await certificates.get(CONFIG.DOMAIN, {
    includeCertificates: false,
    useCryptoModule: false,
  });

  console.log(cert);
}


async function printRaw() {
  console.log(await certificates.print(CONFIG.DOMAIN));
}

async function validate() {
  const domain = "yahoo.com";//CONFIG.DOMAIN
  const cert = await certificates.validate(domain, {
    includeCertificates: true,
    includeChain: true,
    useCryptoModule: true,
    verbose: true,
  });

  console.log(cert);
}

main().then(() => {});
