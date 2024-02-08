const fs = require('fs');
const path = require('path');
const inquirer = require('@inquirer/prompts');
const { exec } = require('child_process');
const convertSavAndJson = require('./convertSavAndJson');
const simplifyObj = require('./simplifyJSON');
const { Console } = require('console');
const { setTimeout } = require('timers');

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
    SimplifyJson: 3
  }
  const mode = await inquirer.select({
    message: 'What you want to do?',
    choices: [
        {
            name: "Cancel",
            value: Modes.Cancel,
        },
        {
            name: "Load",
            value: Modes.Load,
        },
        {
            name: "Save",
            value: Modes.Save,
        },
        {
          name: "Simplify JSON",
          value: Modes.SimplifyJson
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
    openVSCode(worldPath);
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
  } else if(mode === Modes.SimplifyJson) {
    let jsonFiles = folderFiles.filter(f => path.extname(f) === ".json" && f.indexOf(".simp.json") < 0);
    jsonFiles = jsonFiles.map(f => path.basename(f, ".json"));
    for(const jsonFilePath of jsonFiles) {
      const fullFilePathNoExt = path.join(worldPath, jsonFilePath);
      console.log(`Simplifying "${fullFilePathNoExt}.json"`);
      var obj = JSON.parse(fs.readFileSync(fullFilePathNoExt+ ".json"));
      simplifyObj("",obj);
      fs.writeFileSync(fullFilePathNoExt + ".simp.json", JSON.stringify(obj, null, 2));
    }
    for(let savFileName of fs.readdirSync(path.join(worldPath, "Players")).filter(f => path.extname(f) === ".sav")) {
      const fullFilePathNoExt = path.join(path.join(worldPath, "Players"), savFileName);
      console.log(`Simplifying "${fullFilePathNoExt}.json"`);
      var obj = JSON.parse(fs.readFileSync(fullFilePathNoExt+ ".json"));
      simplifyObj("",obj);
      fs.writeFileSync(fullFilePathNoExt + ".simp.json", JSON.stringify(obj, null, 2));
    }
    openVSCode(worldPath);
  }


})();

function openVSCode(worldPath) {
  setTimeout(() => {
    const { stdout, stderr } = exec(`code ${worldPath}`);
  }, 5000);
}
