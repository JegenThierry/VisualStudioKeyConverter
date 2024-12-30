import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import xml2js from "xml2js";

const metaUrl = fileURLToPath(import.meta.url);
const dirname = path.dirname(metaUrl);

const parser = new xml2js.Parser();
let keyStringList = [];

function generateString(name, key) {
  return `${name} - ${key}`;
}

function removeDuplicatesAndSort() {
  const set = new Set();

  for (const entry of keyStringList) {
    set.add(entry);
  }
  keyStringList = Array.from(set);
  keyStringList = keyStringList.sort();
}

function getProductKeys(productKeyObjects) {
  for (const key of productKeyObjects) {
    const name = key.$.Name;

    const details = key.Key.map((x) => ({ keyId: x._, id: x.$.ID }));

    for (const detail of details) {
      keyStringList.push(generateString(name, detail.keyId.trim()));
    }
  }
}

async function parseXmlFile(filename) {
  const filePath = path.join(dirname, filename);
  const fileData = await fs.readFile(filePath, "utf8");

  const data = await parser.parseStringPromise(fileData);
  const { root } = data;

  const productKeys = root?.YourKey[0]?.Product_Key;
  getProductKeys(productKeys);
}

async function writeFile(filename) {
  const fileContent = keyStringList.join("\n");
  await fs.writeFile(filename, fileContent);
}

await parseXmlFile("input.xml");
removeDuplicatesAndSort();
await writeFile("export.txt");
