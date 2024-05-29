import { typeIdentifier } from "../utils/typeIdentifier";

export function documentLevelSchema(fieldName: string, value: string, doc: Record<string, any>, docsWithField: Record<string, Record<string, string>[]>) {
    // Initialize the entry for the value if it does not exist
    if (!docsWithField[value]) {
        docsWithField[value] = [];
    }

    // Get the current entry for the value
    const currentEntry = docsWithField[value];

    // Iterate through the document to populate the fields and their types
    for (const [key, val] of Object.entries(doc)) {
        if (key !== fieldName) {
            let fieldType: string = typeIdentifier(val);

            // Check if the field already exists in the current entry
            const existingField = currentEntry!.find(field => field[key] !== undefined);
            if (existingField) {
                // If the field exists but with a different type, update it
                if (existingField[key] !== fieldType) {
                    existingField[key] = fieldType;
                }
            } else {
                // If the field does not exist, add it
                currentEntry!.push({ [key]: fieldType });
            }
        }
    }
}
