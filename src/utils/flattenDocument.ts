export async function flattenDocument(doc: any, parentKey: string = '', sep: string = '#'): Promise<Record<string, string>> {
    // Flatten the document
    const items: Record<string, string> = {};
    // Helper function to determine the type of an array
    function getArrayType(arr: any[]): string {
        if (arr.length === 0) return 'any[]';
        const firstElemType = typeof arr[0];
        if (Array.isArray(arr[0])) {
            return `${getArrayType(arr[0])}[]`;
        } else if (firstElemType === 'object') {
            return `${JSON.stringify(arr[0])}[]`;
        } else {
            return `${firstElemType}[]`;
        }
    }
    
    for (const [key, value] of Object.entries(doc)) {
        const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
        if (value && typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                items[newKey] = getArrayType(value);
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