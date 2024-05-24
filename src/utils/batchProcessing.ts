import { flattenDocument } from "./flattenDocument";

export async function batchProcessing(batchDocs: any[], fieldTypeCounts: Record<string, number>){
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
        }
    }
}