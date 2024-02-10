const fs = require("fs");
const path = require("path");
const inquirer = require("@inquirer/prompts");
const { exec } = require("child_process");
const convertSavAndJson = require("./convertSavAndJson");
const simplifyObj = require("./simplifyJSON");
const { setTimeout } = require("timers");
const r = require("ramda");

(async function () {
  const saveFilesPath = process.argv[2];
  let folderFiles = fs.readdirSync(saveFilesPath);

  const worldFolderName = await inquirer.select({
    message: "Select World:",
    choices: folderFiles.map((e) => {
      return {
        name: e,
        value: e,
      };
    }),
  });

  const Modes = {
    Cancel: 0,
    Load: 1,
    Save: 2,
    DesimplifyJSON: 3,
    SimplifyJson: 4,
    RestoreBackup: 5,
  };
  const mode = await inquirer.select({
    message: "What you want to do?",
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
        name: "Simplify JSON",
        value: Modes.SimplifyJson,
      },
      {
        name: "Save",
        value: Modes.Save,
      },
      {
        name: "De-simplify simp JSON",
        value: Modes.DesimplifyJSON,
      },
      {
        name: "Restore Backup",
        value: Modes.RestoreBackup,
      },
    ],
  });

  if (mode === Modes.Cancel) {
    process.exit(0);
  }

  const worldPath = path.join(saveFilesPath, worldFolderName);
  folderFiles = fs.readdirSync(worldPath);
  savFolderFiles = folderFiles.filter((f) => path.extname(f) === ".sav");
  const convertPyPath = path.join(__dirname, "palworld-save-tools-cheahjs");
  
  if (mode === Modes.Load) {
    for (let savFileName of savFolderFiles) {
      const savFilePath = path.join(worldPath, savFileName);
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
    for (let savFileName of fs
      .readdirSync(path.join(worldPath, "Players"))
      .filter((f) => path.extname(f) === ".sav")) {
      const savFilePath = path.join(
        path.join(worldPath, "Players"),
        savFileName
      );
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
    openVSCode(worldPath);
  } else if (mode === Modes.Save) {
    for (let savFileName of savFolderFiles) {
      savFileName += ".json";
      const savFilePath = path.join(worldPath, savFileName);
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
    for (let savFileName of fs
      .readdirSync(path.join(worldPath, "Players"))
      .filter((f) => path.extname(f) === ".sav")) {
      savFileName += ".json";
      const savFilePath = path.join(
        path.join(worldPath, "Players"),
        savFileName
      );
      await convertSavAndJson(convertPyPath, savFilePath, savFileName);
    }
  } else if (mode === Modes.SimplifyJson) {
    let jsonFiles = folderFiles.filter(
      (f) => path.extname(f) === ".json" && f.indexOf(".simp.json") < 0
    );
    jsonFiles = jsonFiles.map((f) => path.basename(f, ".json"));
    for (const jsonFilePath of jsonFiles) {
      const fullFilePathNoExt = path.join(worldPath, jsonFilePath);
      console.log(`Simplifying "${fullFilePathNoExt}.json"`);
      var obj = JSON.parse(fs.readFileSync(fullFilePathNoExt + ".json"));
      simplifyObj("", obj);
      fs.writeFileSync(
        fullFilePathNoExt + ".simp.json",
        JSON.stringify(obj, null, 2)
      );
    }
    for (let savFileName of fs
      .readdirSync(path.join(worldPath, "Players"))
      .filter((f) => path.extname(f) === ".sav")) {
      const fullFilePathNoExt = path.join(
        path.join(worldPath, "Players"),
        savFileName
      );
      console.log(`Simplifying "${fullFilePathNoExt}.json"`);
      var obj = JSON.parse(fs.readFileSync(fullFilePathNoExt + ".json"));
      simplifyObj("", obj);
      fs.writeFileSync(
        fullFilePathNoExt + ".simp.json",
        JSON.stringify(obj, null, 2)
      );
    }
    openVSCode(worldPath);
  } else if (mode === Modes.DesimplifyJSON) {
    await desimplifyJSON(worldPath);
    await desimplifyJSON(worldPath+"/Players");
  } else if (mode === Modes.RestoreBackup) {
    await restoreBackup(worldPath);
    await restoreBackup(worldPath+"/Players");
  }
})();

function openVSCode(worldPath) {
  setTimeout(() => {
    const { stdout, stderr } = exec(`code ${worldPath}`);
  }, 5000);
}

/**
 * 
 * @param {string} worldPath 
 */
async function restoreBackup(worldPath) {
  const worldFolderFiles = fs.readdirSync(worldPath);
  const bkpFilesMap = worldFolderFiles.filter(f => path.extname(f) === ".bkp").reduce((acc, curr)=> {
    acc[curr] = path.basename(curr, ".bkp");
    return acc;
  }, {});
  for(const bkpFileName in bkpFilesMap) {
    //console.log(bkpFileName, bkpFilesMap[bkpFileName]);
    fs.copyFileSync(path.join(worldPath, bkpFileName), path.join(worldPath, bkpFilesMap[bkpFileName]));
  }
}

/**
 *
 * @param {string} worldPath
 * @param {[string]} worldFolderFiles
 */
async function desimplifyJSON(worldPath) {
  const worldFolderFiles = fs.readdirSync(worldPath);
  const simpJsonFiles = worldFolderFiles.filter((f) =>
    f.endsWith(".simp.json")
  );
  const allFileBaseNamesToDesimplify = simpJsonFiles
    .map((f) => path.basename(f, ".simp.json"))
    .filter((f) => worldFolderFiles.indexOf(f + ".json") >= 0);
  for (const fileBaseName of allFileBaseNamesToDesimplify) {
    const complexJsonFileName = fileBaseName + ".json";
    const simpJsonFileName = fileBaseName + ".simp.json";
    console.log(
      `\n--------------------- ${simpJsonFileName} ---------------------`
    );
    console.log(
      `+ Will de-simplify "${simpJsonFileName}" back into "${complexJsonFileName}"`
    );
    console.log(`+ Loading ${simpJsonFileName}`);
    const simpleObj = JSON.parse(
      fs.readFileSync(path.join(worldPath, simpJsonFileName))
    );
    console.log(`+ Loading ${complexJsonFileName}`);
    const complexObj = JSON.parse(
      fs.readFileSync(path.join(worldPath, complexJsonFileName))
    );
    console.log(`+ De-simplification started`);
    
    await _inflateSimpleObj([simpleObj], 0);

    console.log(`+ Inflated simplified JSON successfully`);

    await mergeDeep(complexObj, simpleObj, "");

    console.log(`+ Finished merging successfully`);
    fs.writeFileSync(path.join(worldPath, complexJsonFileName), JSON.stringify(complexObj, null, 2));
    console.log(`+ Saved merged obj to disk at "${path.join(worldPath, complexJsonFileName)}".`);

    console.log(`+ SUCCESS for ${complexJsonFileName}`);

    /**
     * 
     * @param {{ [key :string] : any}} simpleObjParent
     * @param {string} parentKey 
     */
    async function _inflateSimpleObj(simpleObjParent, parentKey) {
      const simpleObj = simpleObjParent[parentKey];
      const isObjOrArray = typeof simpleObj === 'object' || Array.isArray(simpleObj); 
      if(!simpleObj || !isObjOrArray) {
        return;
      }
      for (const prop in simpleObj) {
        await _inflateSimpleObj(simpleObj, prop);
        if(typeof prop !== `string`) {
          continue;
        }
        const segments = prop.split('/');
        if(segments.length === 1) {
          continue;
        }
        const newSimpObj = segments.reduceRight((acc, curr) => {
          return {
            [curr]: acc,
          }
        }, simpleObj[prop]);
        simpleObjParent[parentKey] = newSimpObj;
        // console.log(parentKey, prop, simpleObj[prop]);
        // console.log(parentKey, simpleObjParent[parentKey]);
        // console.log("_____________________________________________________________");
        // await keypress();
      }
    }
  }
}

function Timer(seconds) {
  return new Promise((res, rej)=>{
    setTimeout(res, seconds * 1000);
  });
}

const keypress = async () => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise(resolve => process.stdin.once('data', data => {
    if(!data) {
      process.stdin.setRawMode(false)
      resolve();
    }
    const byteArray = [...data]
    process.stdin.setRawMode(false)
    if (byteArray.length > 0 && byteArray[0] === 3) {
      console.log('^C')
      process.exit(1)
    }
    resolve()
  }))
}

async function mergeDeep(target, source, fullPath) {
  if(!isMergeable(source)) {
    return;
  }
  
  for(const sourceKey in source) {
    const keyFullPath = fullPath + `/${sourceKey}`;
    if(isMergeable(source[sourceKey])) {
      if(!target[sourceKey] && target[sourceKey] !== 0) {
        target[sourceKey] = Array.isArray(source[sourceKey])? [] : {};
      }
      await mergeDeep(target[sourceKey], source[sourceKey], keyFullPath);
    } else if (source[sourceKey] !== target[sourceKey]) {
      //Source value is primitive
      target[sourceKey] = source[sourceKey];
      console.log(`-- "${keyFullPath}" = ${target[sourceKey]}`);
      console.log(`_______________________________________________________`);
      // await keypress();
    }
  }

  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  function isMergeable(item) {
    return item && (typeof item === "object" || Array.isArray(item));
  }
}
