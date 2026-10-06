/* eslint-disable */
const fs = require("node:fs");
const { getFolders, parseArgs, collectFolderFiles } = require("./lib");

const { ids: teamIds, filters } = parseArgs(process.argv.slice(2));

// Начало текущего часа. Это станет отметкой "список актуален до этого
// момента": всё, что изменится в Figma позже, попадёт в следующее окно.
//
// Округляем вниз, а не берём точное время, чтобы окна перекрывались и ничего
// не провалилось между ними из-за расхождения часов с серверами Figma.
// Перекрытие до часа стоит примерно одного лишнего файла за цикл.
const syncedUntil = new Date();
syncedUntil.setUTCMinutes(0, 0, 0);

// Пауза между папками: эндпоинты папок у Figma во втором тире, это 25
// запросов в минуту на Pro с Full-местом и всего 5 на Collab/Viewer.
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const allFiles = [];
  const promises = [];

  for (const teamId of teamIds) {
    try {
      const folderData = await getFolders(teamId);
      const folders = folderData.folders || folderData.projects || [];

      for (const folder of folders) {
        const folderResults = await collectFolderFiles(
          folder.id,
          teamId,
          filters,
          promises,
          folder.name,
        );
        allFiles.push(...folderResults);
        await sleep(10 * 1000);
      }
    } catch (error) {
      throw error;
    }
  }

  Promise.all(promises).then(() => {
    fs.writeFileSync(__dirname + "/../files.json", JSON.stringify(allFiles, null, 2));

    // Отметку двигаем только здесь: сюда не доходит выполнение, если запрос
    // к Figma упал. Лежит рядом со скачанными макетами, чтобы пережить
    // пересоздание контейнера.
    fs.writeFileSync(
      process.env.DOWNLOAD_PATH + "/.synced-until",
      syncedUntil.toISOString(),
    );
  });
})();

