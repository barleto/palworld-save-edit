const debug = false;

function debugLog(...arg) {
    if (debug) {
        console.log(...arg);
    }
}

function getOnlyObjectKey(obj) {
    return obj && Object.keys(obj)[0] ? Object.keys(obj)[0] : undefined;
}

function decorateTreeFirstPass(parent, parentKey) {

    if ( parent[parentKey] === null || parent[parentKey] === undefined || typeof parent[parentKey] !== "object" ) {
        return;
    }

    for (const key in parent[parentKey]) {
        decorateTreeFirstPass(parent[parentKey], key);
        if(key === "value" && (parent[parentKey]["key"] === undefined || parent[parentKey]["key"] === null)) {
            parent[parentKey+"/value"] = parent[parentKey]["value"];
            delete parent[parentKey];
            break;
        } else if(key === "values" && (parent[parentKey]["key"] === undefined || parent[parentKey]["key"] === null) && !Array.isArray(parent[parentKey]["values"])) {
            parent[parentKey+"/values"] = parent[parentKey]["values"];
            delete parent[parentKey];
            break;
        }
    }   
}

function decorateTreeSecondPass(parent, parentKey) {

    if ( parent[parentKey] === null || parent[parentKey] === undefined || typeof parent[parentKey] !== "object" ) {
        return;
    }
    for (const key in parent[parentKey]) {
        decorateTreeSecondPass(parent[parentKey], key);
    }
    
    // for (const key in parent[parentKey]) {
    //     const childItem = parent[parentKey][key];
    //     if ( childItem && (childItem.key || childItem.key === 0) && childItem.value && Object.keys(childItem).length === 2 ) {
    //         decorateTreeSecondPass(childItem, "key");
    //         decorateTreeSecondPass(childItem, "value");
    //         const newKey = childItem.key;
    //         const value = childItem.value;
    //         const newKeyExists = newKey || newKey === 0;
    //         if (typeof newKey !== "object" && newKeyExists) {
    //             parent[parentKey][key] = {
    //                 [newKey]: value,
    //             };
    //         } else {
    //             parent[parentKey][key] = {
    //                 key: newKey,
    //                 value: value,
    //             };
    //         }
    //     }
    // }

    if(!Array.isArray(parent[parentKey])) {
        for (const key in parent[parentKey]) {
            const childItem = parent[parentKey][key];
            if (typeof childItem === "object" && childItem && !Array.isArray(childItem)) {
                if ( typeof key === "string" && Object.keys(childItem).length === 1 && typeof Object.keys(childItem)[0] === "string") {
                    decorateTreeSecondPass(childItem, Object.keys(childItem)[0]);
                    parent[parentKey][`${key}/${Object.keys(childItem)[0]}`] = childItem[Object.keys(childItem)[0]];
                    delete parent[parentKey][key];
                } 
            }
        }
    }
}

function simplifyUnrealSaveObj(parentPath, obj) {
    if (!(Array.isArray(obj) || typeof obj === "object")) {
        return obj;
    }

    for (const key in obj) {
        if (!key) {
            continue;
        }
        decorateTreeFirstPass(obj, key);
        decorateTreeSecondPass(obj, key);
    }
    return obj;
}

module.exports = simplifyUnrealSaveObj;
