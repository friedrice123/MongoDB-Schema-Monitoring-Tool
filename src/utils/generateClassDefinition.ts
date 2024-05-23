import fs from 'fs';

export function generateFieldTypeJson(fieldTypeCounts: Record<string, number>): Record<string, any> {
    const fieldTypeJson: Record<string, any> = {};

    for (const fieldTypePair of Object.keys(fieldTypeCounts)) {
        const [field, type] = fieldTypePair.split(':');
        if (field && type) {
            const fieldParts = field.split('.');
            let currentLevel = fieldTypeJson;

            for (let i = 0; i < fieldParts.length; i++) {
                const part = fieldParts[i];
                if(part){
                    if (i === fieldParts.length - 1) {
                        if (currentLevel[part]) {
                            if (typeof currentLevel[part] === 'string') {
                                currentLevel[part] = `${currentLevel[part]} | ${type}`;
                            } else if (typeof currentLevel[part] === 'object' && currentLevel[part]._type) {
                                currentLevel[part] = {
                                    _type: currentLevel[part]._type,
                                    [type]: true
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

export function generateTypeScriptInterfaces(json: Record<string, any>, interfaceName: string): string {
    let interfaceDefinitions = '';

    function parseObject(obj: Record<string, any>, currentInterfaceName: string): string {
        let interfaceContent = `interface ${currentInterfaceName} {\n`;

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                interfaceContent += `  ${key}: ${mapType(value)};\n`;
            } else if (typeof value === 'object') {
                interfaceContent += `  ${key}: {\n${parseNestedObject(value)}  };\n`;
            }
        }

        interfaceContent += '}\n\n';
        return interfaceContent;
    }

    function parseNestedObject(obj: Record<string, any>): string {
        let nestedContent = '';

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                nestedContent += `    ${key}: ${mapType(value)};\n`;
            } else if (typeof value === 'object') {
                nestedContent += `    ${key}: {\n${parseNestedObject(value)}    };\n`;
            }
        }

        return nestedContent;
    }

    function mapType(type: string | Record<string, any>): string {
        if (typeof type === 'string') {
            if (type === 'array') return 'any[]';
            return type.includes('|') ? `${type}` : type;
        } else {
            const nestedTypes: string[] = [];
            if (type._type) {
                nestedTypes.push(type._type);
            }
            for (const [nestedType, _] of Object.entries(type)) {
                if (nestedType !== '_type') {
                    nestedTypes.push(nestedType);
                }
            }
            return nestedTypes.join(' | ');
        }
    }

    interfaceDefinitions += parseObject(json, interfaceName);
    return interfaceDefinitions;
}

export function saveTypeScriptInterfacesToFile(interfaceName: string, interfaceContent: string, outputPath: string) {
    const filePath = `${outputPath}/${interfaceName}.ts`;
    fs.writeFileSync(filePath, interfaceContent);
    console.log(`TypeScript interfaces saved to ${filePath}`);
}
