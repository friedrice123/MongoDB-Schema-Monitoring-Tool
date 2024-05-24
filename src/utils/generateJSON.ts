export function generateFieldTypeJson(fieldTypeCounts: Record<string, number>): Record<string, any> {
    const fieldTypeJson: Record<string, any> = {};

    for (const fieldTypePair of Object.keys(fieldTypeCounts)) {
        const [field, type] = fieldTypePair.split(':');
        if (field && type) {
            const fieldParts = field.split('.');
            let currentLevel = fieldTypeJson;

            for (let i = 0; i < fieldParts.length; i++) {
                const part = fieldParts[i];
                if (part) {
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
                    } else {
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