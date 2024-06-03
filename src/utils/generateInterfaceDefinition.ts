import fs from 'fs';

export async function generateTypeScriptInterfaces(json: Record<string, any>, interfaceName: string): Promise<string> {
    let interfaceDefinitions = '';
    const createdInterfaces: Record<string, string> = {};

    // Parse the JSON object and generate TypeScript interfaces
    function parseObject(obj: Record<string, any>, currentInterfaceName: string): string {
        let interfaceContent = `interface ${currentInterfaceName} {\n`;

        for (let [key, value] of Object.entries(obj)) {
            if (key === '_type') {
                continue;
            }
            if (typeof value === 'string') {
                if (value.endsWith('[]')) {
                    // Handle array types
                    const arrayType = value.slice(0, -2);
                    if(value[value.length - 1] == ']' && value[value.length - 2] == '[' && value[value.length - 3] == '}'){
                        let newvalue = value.slice(0, value.length - 2);
                        newvalue = JsonToTS(newvalue);
                        interfaceContent += `  ${key}: ${mapType(newvalue, `${currentInterfaceName}${capitalizeFirstLetter(key)}`)};\n`;
                    }
                    else interfaceContent += `  ${key}: ${mapType(arrayType, `${currentInterfaceName}${capitalizeFirstLetter(key)}`)}[];\n`;
                } else {
                    interfaceContent += `  ${key}: ${mapType(value, `${currentInterfaceName}${capitalizeFirstLetter(key)}`)};\n`;
                }
            } else if (typeof value === 'object') {
                const nestedInterfaceName = `${currentInterfaceName}${capitalizeFirstLetter(key)}`;
                let typeAnnotation = nestedInterfaceName;
                if (value._type) {
                    const types = value._type.split('|').map((t: string) => t.trim()).filter((t: string) => t !== 'object');
                    typeAnnotation = types.length ? `${types.join(' | ')} | ${nestedInterfaceName}` : nestedInterfaceName;
                }
                createdInterfaces[nestedInterfaceName] = parseObject(value, nestedInterfaceName);
                interfaceContent += `  ${key}: ${typeAnnotation};\n`;
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
                ts += `${key}: ${JsonToTS(JSON.stringify(obj[key]))};`;
            } else {
                ts += `${key}: ${typeof obj[key]};`;
            }
        }
        return `{${ts}}[]`;
    }

    // Generate the main interface and any nested interfaces
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

