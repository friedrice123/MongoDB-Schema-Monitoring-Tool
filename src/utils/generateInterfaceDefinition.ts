import fs from 'fs';

export async function generateTypeScriptInterfaces(json: Record<string, any>, interfaceName: string): Promise<string> {
    let interfaceDefinitions = '';
    const createdInterfaces: Record<string, string> = {};
    // Parse the JSON object and generate TypeScript interfaces
    function parseObject(obj: Record<string, any>, currentInterfaceName: string): string {
        currentInterfaceName = interfaceNameRectify(currentInterfaceName)
        let interfaceContent = `interface ${currentInterfaceName} {\n`;

        for (let [key, value] of Object.entries(obj)) {
            if (key === '_type') {
                continue;
            }
            if (typeof value === 'string') {
                const types = value.split('|').map((t: string) => t.trim());
                for (let i = 0; i < types.length; i++) {
                    const t = types[i];
                    const arrayDepth = getArrayDepth(t!);
                    let baseType = t;
                    for (let j = 0; j < arrayDepth; j++) {
                        baseType = stripArray(baseType!);
                    }

                    if (baseType!.startsWith('{')) {
                        const newt = JsonToTS(baseType!);
                        if (i === 0) {
                            if (types.length === 1) {
                                interfaceContent += `  "${key}": ${mapType(newt, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)};\n`;
                            } else {
                                interfaceContent += `  "${key}": ${mapType(newt, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)}`;
                            }
                        } else if (i === types.length - 1) {
                            interfaceContent += ` | ${mapType(newt, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)};\n`;
                        } else {
                            interfaceContent += ` | ${mapType(newt, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)}`;
                        }
                    } else {
                        if (i === 0) {
                            if (types.length === 1) {
                                interfaceContent += `  "${key}": ${mapType(baseType!, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)};\n`;
                            } else {
                                interfaceContent += `  "${key}": ${mapType(baseType!, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)}`;
                            }
                        } else if (i === types.length - 1) {
                            interfaceContent += ` | ${mapType(baseType!, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)};\n`;
                        } else {
                            interfaceContent += ` | ${mapType(baseType!, `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`)}${'[]'.repeat(arrayDepth)}`;
                        }
                    }
                }
            } else if (typeof value === 'object') {
                const nestedInterfaceName = `${currentInterfaceName}${interfaceNameRectify(capitalizeFirstLetter(key))}`;
                let typeAnnotation = nestedInterfaceName;
                if (value._type) {
                    const types = value._type.split('|').map((t: string) => t.trim()).filter((t: string) => t !== 'object');
                    typeAnnotation = types.length ? `${types.join(' | ')} | ${nestedInterfaceName}` : nestedInterfaceName;
                }
                createdInterfaces[nestedInterfaceName] = parseObject(value, nestedInterfaceName);
                interfaceContent += `  "${key}": ${typeAnnotation};\n`;
            }
        }

        interfaceContent += '}\n\n';
        return interfaceContent;
    }

    // Capitalize the first letter of a string
    function capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Map the data types to TypeScript types and handle union types
    function mapType(type: string | Record<string, any>, interfaceName: string): string {
        interfaceName = interfaceNameRectify(interfaceName)
        if (typeof type === 'string') {
            if (type.includes('|')) {
                return type.split('|').map(t => {
                    t = t.trim();
                    if (t === 'object') {
                        const nestedInterfaceName = interfaceName;
                        createdInterfaces[nestedInterfaceName] = parseObject({}, nestedInterfaceName);
                        return nestedInterfaceName;
                    }
                    return t;
                }).join(' | ');
            } else {
                return type;
            }
        } else {
            const nestedInterfaceName = interfaceName;
            createdInterfaces[nestedInterfaceName] = parseObject(type, nestedInterfaceName);
            return nestedInterfaceName;
        }
    }

    function JsonToTS(json: string): string {
        let ts = '';
        let obj = JSON.parse(json);
        for (let key in obj) {
            if (typeof obj[key] === 'object') {
                ts += `"${key}": ${JsonToTS(JSON.stringify(obj[key]))};`;
            } else {
                ts += `"${key}": ${typeof obj[key]};`;
            }
        }
        return `{${ts}}[]`;
    }

    function getArrayDepth(type: string): number {
        let depth = 0;
        while (type.endsWith('[]')) {
            depth++;
            type = stripArray(type);
        }
        return depth;
    }

    function stripArray(type: string): string {
        return type.endsWith('[]') ? type.slice(0, -2) : type;
    }

    interfaceDefinitions += parseObject(json, interfaceName);
    for (const [nestedInterfaceName, nestedInterfaceContent] of Object.entries(createdInterfaces)) {
        interfaceDefinitions += nestedInterfaceContent;
    }

    return interfaceDefinitions;
}

// Save the TypeScript interfaces to a file
export function saveTypeScriptInterfacesToFile(interfaceName: string, interfaceContent: string, outputPath: string) {
    const filePath = `${outputPath}/${interfaceName}.ts`;
    fs.writeFileSync(filePath, interfaceContent);
    console.log(`TypeScript interfaces saved to ${filePath}`);
}

function interfaceNameRectify(interfaceName: string): string {
    let rect = '';
    for (let i = 0; i < interfaceName.length; i++) {
        const letter = interfaceName[i];
        if (!((letter! >= 'A' && letter! <= 'Z') || (letter! >= 'a' && letter! <= 'z') || (letter! >= '0' && letter! <= '9') || (letter! === '_'))) {
            rect += '_';
        } else {
            rect += letter;
        }
    }
    return rect;
}
