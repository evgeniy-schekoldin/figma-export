/* eslint-disable */
// Печатает, сколько файлов из files.json ещё не скачано.
// run.sh по этому числу решает: дожимать остаток или пересобирать список.

const fs = require("node:fs");
const path = require("node:path");

let folders = [];
try {
  folders = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "files.json"), "utf-8"),
  );
} catch {
  // списка нет или он битый — дожимать нечего
}

let pending = 0;
for (const folder of folders) {
  for (const file of folder.files || []) {
    if (!file.downloaded) pending++;
  }
}

console.log(pending);
