export function typeIdentifier(val: any): string {
    let fieldType: string;

    if (val && typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
            if (val.length > 0) {
                const firstElemType = typeIdentifier(val[0]);
                fieldType = `${firstElemType}[]`;
            } else {
                fieldType = 'any[]';
            }
        } else {
            // For objects, recursively determine the types of their properties
            const fields = Object.entries(val).map(([key, value]) => {
                return `"${key}": "${typeIdentifier(value)}"`;
            });
            fieldType = `{${fields.join(', ')}}`;
        }
    } else {
        fieldType = typeof val;
    }
    return fieldType;
}