const debug = false;

function debugLog(...arg) {
    if(debug) {
        console.log(...arg);
    }
}

function replaceWithValue(obj) {
    if(obj === null || obj === undefined || Array.isArray(obj) || typeof obj !== 'object') {
        debugLog("## 1");
        return obj;
    }
    if(obj.values !== null && obj.values !== undefined) {
        debugLog("## 2");
        return obj.values;
    }

    if(obj.value !== null && obj.value !== undefined) {
        if(obj.key === undefined) {
            debugLog("## 3");
            return obj.value;
        }
        return obj;

        if(obj.key === undefined) {
            debugLog("## 3");
            return obj.value;
        }
        if(typeof obj.key !== 'object') {
            debugLog("## 6");
            return {
                [obj.key]: obj.value
            };
        } else {
            if(Object.keys(obj.key).length === 1) {
                debugLog("## 4");
                return {
                    [Object.keys(obj.key)[0]] : obj.value
                }
            } else {
                debugLog("## 5");
                return obj;
            }
        }
    }

    // if(obj.RawData) {
    //     debugLog("## 8");
    //     return obj.RawData;
    // }
    debugLog("## 9");
    return obj;
}

function simplifyUnrealSaveObj(parentPath, obj) {
    if(!(Array.isArray(obj) || typeof obj === 'object')) {
        return obj;
    }
    // debugLog(`Visiting ${parentPath}`);
    for(const key in obj) {
        if(!(Array.isArray(obj) || typeof obj === 'object')) {
            continue;
        }
        simplifyUnrealSaveObj(`${parentPath}.${key}`, obj[key]);
        obj[key] = replaceWithValue(obj[key]);
    }
    return obj;
}

module.exports = simplifyUnrealSaveObj;