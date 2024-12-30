import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import xml2js from "xml2js";
import yargs from "yargs/yargs";

// Accept -i and -e arguments for input and export.
const argv = yargs(process.argv.slice(2))
  .option("input", {
    alias: "i",
    type: "string",
    description: "Path to the input XML file.",
    demandOption: true,
  })
  .option("export", {
    alias: "e",
    type: "string",
    description: "Name of the file you want the export to have.",
    demandOption: true,
  })
  .help().argv;

const metaUrl = fileURLToPath(import.meta.url);
const dirname = path.dirname(metaUrl);

const parser = new xml2js.Parser();
let keyStringList = [];

/**
 * Generates a formatted string from name and key.
 */
function generateString(name, key) {
  return `${name} - ${key}`;
}

/**
 * Removes duplicates from the key list and sorts it.
 */
function removeDuplicatesAndSort() {
  const set = new Set(keyStringList);
  keyStringList = Array.from(set).sort();
}

/**
 * Extracts product keys from the XML product key objects.
 */
function getProductKeys(productKeyObjects) {
  for (const key of productKeyObjects) {
    const name = key.$.Name;
    const details = key.Key.map((x) => ({ keyId: x._, id: x.$.ID }));

    for (const detail of details) {
      keyStringList.push(generateString(name, detail.keyId.trim()));
    }
  }
}

/**
 * Parses an XML file and extracts key data.
 */
async function parseXmlFile(filename) {
  try {
    const filePath = path.resolve(dirname, filename);
    const fileData = await fs.readFile(filePath, "utf8");

    const data = await parser.parseStringPromise(fileData);
    const { root } = data;

    const productKeys = root?.YourKey?.[0]?.Product_Key;
    if (productKeys) {
      getProductKeys(productKeys);
    } else {
      console.warn("No product keys found in the XML file.");
    }
  } catch (err) {
    console.error(`Error parsing XML file: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Writes the processed data to a file.
 */
async function writeFile(filename) {
  try {
    const fileContent = keyStringList.join("\n");
    await fs.writeFile(filename, fileContent, "utf8");
    console.log(`File written successfully to ${filename}`);
  } catch (err) {
    console.error(`Error writing file: ${err.message}`);
    process.exit(1);
  }
}

// Main execution
(async () => {
  const inputFileName = argv.input;
  const exportFileName = argv.export;

  await parseXmlFile(inputFileName);
  removeDuplicatesAndSort();
  await writeFile(exportFileName);
})();
