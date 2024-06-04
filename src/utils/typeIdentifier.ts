export function typeIdentifier(val: any): string {
    let fieldType;

    if (val && typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
            if (val.length > 0) {
                let firstElemType = typeIdentifier(val[0]);
                if(typeof firstElemType === 'object') {
                    firstElemType = JSON.stringify(firstElemType)
                    fieldType = `${firstElemType}[]`
                }
                else fieldType = `${firstElemType}[]`;
            } else {
                fieldType = 'any[]';
            }
        } else {
            // For objects, recursively determine the types of their properties
            const fields = Object.entries(val).map(([key, value]) => {
                return `"${key}": ${JSON.stringify(typeIdentifier(value))}`;
            });
            fieldType = JSON.parse(`{${fields.join(', ')}}`);
        }
    } else {
        fieldType = typeof val;
    }
    return fieldType;
}