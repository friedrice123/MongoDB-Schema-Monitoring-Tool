export function flattenDocument(doc: any, parentKey: string = '', sep: string = '.'): Record<string, string> {
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
                items[newKey] = 'object';
                Object.assign(items, flattenDocument(value, newKey, sep));
            }
        } else {
            items[newKey] = typeof value;
        }
    }
    return items;
}