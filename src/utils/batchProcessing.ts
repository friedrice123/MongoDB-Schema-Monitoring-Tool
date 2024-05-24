import { flattenDocument } from "./flattenDocument";

export function batchProcessing(batchDocs: any[], fieldTypeCounts: Record<string, number>){
    for (const doc of batchDocs) {
        const flattenedDoc = flattenDocument(doc);
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