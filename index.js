const fs = require('fs');
const path = require('path');
const inquirer = require('@inquirer/prompts');
const { exec } = require('child_process');
const convertSavAndJson = require('./convertSavAndJson');

(async function() {

  const saveFilesPath = process.argv[2];
  let folderFiles = fs.readdirSync(saveFilesPath);

  const worldFolderName = await inquirer.select({
      message: 'Select World:',
      choices: folderFiles.map(e => {
        return {
          name: e,
          value: e
        };
      }),
  });

  const Modes = {
    Cancel: 0,
    Load: 1,
    Save: 2,
  }
  const mode = await inquirer.select({
    message: 'What you want to do?',
    choices: [
        {
            name: "Cancel",
            value: 0,
        },
        {
            name: "Load",
            value: 1,
        },
        {
            name: "Save",
            value: 2,
        }
    ],
});

  if(mode === Modes.Cancel) {
    process.exit(0);
  }

  const worldPath = path.join(saveFilesPath, worldFolderName);
  folderFiles = fs.readdirSync(worldPath);
  savFolderFiles = folderFiles.filter(f => path.extname(f) === ".sav");
  const convertPyPath = path.join(__dirname, "palworld-save-tools-cheahjs");
  console.log(convertPyPath);
  if(mode === Modes.Load) {
    for(let savFileName of savFolderFiles) {
      const savFilePath = path.join(worldPath, savFileName);
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
    for(let savFileName of fs.readdirSync(path.join(worldPath, "Players")).filter(f => path.extname(f) === ".sav")) {
      const savFilePath = path.join(path.join(worldPath, "Players"), savFileName);
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
    const { stdout, stderr } = exec(`code ${worldPath}`);
  } else if(mode === Modes.Save){
    for(let savFileName of savFolderFiles) {
      savFileName += ".json";
      const savFilePath = path.join(worldPath, savFileName);
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
    for(let savFileName of fs.readdirSync(path.join(worldPath, "Players")).filter(f => path.extname(f) === ".sav")) {
      savFileName += ".json";
      const savFilePath = path.join(path.join(worldPath, "Players"), savFileName);
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
  }


})();
