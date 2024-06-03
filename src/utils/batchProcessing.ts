import { fieldName } from "../index";
import { documentLevelSchema } from "../services/documentLevelRetrieval";
import { flattenDocument } from "./flattenDocument";

export async function batchProcessing(batchDocs: any[], fieldTypeCounts: Record<string, number>, docsWithField: Record<string, Record<string,string>>) {
    // Loop through each document in the batch
    for (const doc of batchDocs) {
        // Lay down all the objects as a flat structure showing the fields inside the objects in a recursive fashion
        const flattenedDoc = await flattenDocument(doc);

        // Count the number of documents a field appears in and its data type
        for (const [field, fieldType] of Object.entries(flattenedDoc)) {
            const fieldTypePair = `${field}:${fieldType}`;
            if (fieldTypeCounts[fieldTypePair]) {
                fieldTypeCounts[fieldTypePair] += 1;
            } else {
                fieldTypeCounts[fieldTypePair] = 1;
            }
            if (fieldName === field) {
                const value = doc[fieldName];
                if (typeof value === 'string') {
                    documentLevelSchema(fieldName, value, doc, docsWithField);
                }
            }
        }
    }
}