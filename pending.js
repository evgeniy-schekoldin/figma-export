/* eslint-disable */

const fs = require("node:fs");
const path = require("node:path");

let folders = [];
try {
  folders = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "files.json"), "utf-8"),
  );
} catch {

}

let pending = 0;
for (const folder of folders) {
  for (const file of folder.files || []) {
    if (!file.downloaded) pending++;
  }
}

console.log(pending);
