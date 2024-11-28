console.log("XXX loader.ts start");

async function main() {
  const translations = await import("./translations.ts");
  console.log("XXX loader.ts translations:", translations.translations);
}

main();
