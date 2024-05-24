export async function flattenDocument(doc: any, parentKey: string = '', sep: string = '.'): Promise<Record<string, string>> {
    // Flatten the document
    const items: Record<string, string> = {};
    for (const [key, value] of Object.entries(doc)) {
        const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
        if (value && typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    const firstElemType = typeof value[0];
                    items[newKey] = `${firstElemType}[]`;
                } else {
                    items[newKey] = 'any[]';
                }
            } else {
                // Recursively flatten the object
                items[newKey] = 'object';
                Object.assign(items, await flattenDocument(value, newKey, sep));
            }
        } else {
            // Store the data type of the field
            items[newKey] = typeof value;
        }
    }
    return items;
}