export async function generateFieldTypeJson(fieldTypeCounts: Record<string, number>): Promise<Record<string, any>> {
    const fieldTypeJson: Record<string, any> = {};
    // Loop through each field type pair and generate the JSON structure
    for (const fieldTypePair of Object.keys(fieldTypeCounts)) {
        let [field, type] = fieldTypePair.split(':');
        if(type != undefined && type[0] === '{'){
            let i = 0;
            while(i < fieldTypePair.length && fieldTypePair[i] !== '{'){
                i++;
            }
            type = fieldTypePair.slice(i);
        }
        if (field && type) {
            const fieldParts = field.split('#');
            let currentLevel = fieldTypeJson;
            // Traverse the JSON structure and create the necessary objects
            for (let i = 0; i < fieldParts.length; i++) {
                const part = fieldParts[i];
                if (part) {
                    // If it's the last part of the field, add the data type
                    if (i === fieldParts.length - 1) {
                        if (currentLevel[part]) {
                            if (typeof currentLevel[part] === 'string') {
                                currentLevel[part] = `${currentLevel[part]} | ${type}`;
                            } else if (typeof currentLevel[part] === 'object' && currentLevel[part]._type) {
                                currentLevel[part] = {
                                    _type: currentLevel[part]._type
                                };
                            }
                        } else {
                            currentLevel[part] = type;
                        }
                    }
                    // If the part doesn't exist, create an object 
                    else {
                        if (!currentLevel[part]) {
                            currentLevel[part] = {};
                        } else if (typeof currentLevel[part] === 'string') {
                            currentLevel[part] = { _type: currentLevel[part] };
                        }
                        currentLevel = currentLevel[part];
                    }
                }
            }
        }
    }

    return fieldTypeJson;
}