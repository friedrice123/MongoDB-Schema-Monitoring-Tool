import fs from 'fs';

export async function generateTypeScriptInterfaces(json: Record<string, any>, interfaceName: string): Promise<string> {
    let interfaceDefinitions = '';
    // Parse the JSON object and generate TypeScript interfaces
    function parseObject(obj: Record<string, any>, currentInterfaceName: string): string {
        let interfaceContent = `interface ${currentInterfaceName} {\n`;

        for (let [key, value] of Object.entries(obj)) {
            if (key === '_type') {
                continue;
            }
            if (typeof value === 'string') {
                if(value[value.length - 1] == ']' && value[value.length - 2] == '[' && value[value.length - 3] == '}'){
                    const newvalue = value.slice(0, value.length - 2);
                    value = JsonToTS(newvalue);
                }
                interfaceContent += `  ${key}: ${mapType(value)};\n`;
            } else if (typeof value === 'object') {
                const typeAnnotation = value._type ? `${mapType(removeObjectType(value._type))} ` : '';
                interfaceContent += `  ${key}: ${typeAnnotation}{\n${parseNestedObject(value)}  };\n`;
            }
        }

        interfaceContent += '}\n\n';
        return interfaceContent;
    }
    // Parse nested objects
    function parseNestedObject(obj: Record<string, any>): string {
        let nestedContent = '';

        for (const [key, value] of Object.entries(obj)) {
            if (key === '_type') {
                continue;
            }
            if (typeof value === 'string') {
                nestedContent += `    ${key}: ${mapType(value)};\n`;
            } else if (typeof value === 'object') {
                const typeAnnotation = value._type ? `${mapType(removeObjectType(value._type))}` : '';
                nestedContent += `    ${key}: ${typeAnnotation}{\n${parseNestedObject(value)}    };\n`;
            }
        }

        return nestedContent;
    }
    // Map the data types to TypeScript types and handle union types
    function mapType(type: string | Record<string, any>): string {
        if (typeof type === 'string') {
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
    // Remove the 'object' type from the union types, instead output the whole object
    function removeObjectType(type: string): string {
        const objectType = type.split(' | ').filter(t => t !== 'object').join(' | ') + ' | ';
        if(objectType === ' | '){
            return '';
        }
        return objectType;
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

    interfaceDefinitions += parseObject(json, interfaceName);
    return interfaceDefinitions;
}
// Save the TypeScript interfaces to a file
export function saveTypeScriptInterfacesToFile(interfaceName: string, interfaceContent: string, outputPath: string) {
    const filePath = `${outputPath}/${interfaceName}.ts`;
    fs.writeFileSync(filePath, interfaceContent);
    console.log(`TypeScript interfaces saved to ${filePath}`);
}