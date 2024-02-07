const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const fs = require('fs');
const simplifyObj = require('./simplifyJSON');

/**
 * Given a path and optional label, attempts to convert the file to either JSON or SAV.
 * This is entirely dependent on CheahJS's save-tools library, which can be found here:
 * https://github.com/cheahjs/palworld-save-tools
 * @param {string} relativeInstallPath Relative path to the save-tools install, e.g. "./palworld-save-tools-cheahjs"
 * @param {string} targetPath Target file path for a .sav or .json file. Output will be the opposite format in the same directory.
 * @param {string} label Optional label for use in console output, makes things more human-friendly
 */
const convertSavAndJson = async (relativeInstallPath, targetPath, label = '') => {

  let convertTargetType = 'SAV';
  if (targetPath.endsWith('.sav')) {
    convertTargetType = 'JSON';
  }
  console.info(`Running CheahJS' awesome save-tools to convert to ${convertTargetType} in ${targetPath}`);

  const { stdout, stderr } = await execAsync(`python ${relativeInstallPath}\\convert.py --force ${targetPath}`);
  console.log(stdout);

  if (stderr) {
    console.error('Conversion Error:', stderr);
    return;
  } else {
    console.log(`Successfully converted ${label || ''} to ${convertTargetType}!`);
  }

  try {
    if(targetPath.endsWith('.sav')) {
      targetPath + ".json";
      var obj = JSON.parse(fs.readFileSync(targetPath + ".json"));
      simplifyObj("",obj);
      fs.writeFileSync(targetPath + ".simp.json", JSON.stringify(obj, null, 2));
    }
  } catch(e) {
    console.log(e);
  }

  return;
}

module.exports = convertSavAndJson;
