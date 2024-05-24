import { MongoHelper } from './mongoHelper';
import { ObjectId } from 'mongodb';
import { CSVHelper } from './csvUtils';
import { generateTypeScriptInterfaces, saveTypeScriptInterfacesToFile } from './generateInterfaceDefinition';
import { generateFieldTypeJson } from './generateJSON';
import { intervalWindow } from '../config';
import fs from 'fs';
import { batchProcessing } from './batchProcessing';

export async function processDocuments(connectionString: string, dbName: string, collectionName: string) {
    const mongoHelper = new MongoHelper(connectionString);
    const collection = mongoHelper.getCollection(dbName, collectionName);

    const fieldTypeCounts: Record<string, number> = {};
    const startTime_all = Date.now();
    let startTimestamp = new Date(0);  // Start from the epoch time
    while (true) {
        const endTimestamp = new Date(startTimestamp.getTime() + intervalWindow);
        const batchDocs = await mongoHelper.findDocuments(
            collection,
            { _id: { $gt: ObjectId.createFromTime(startTimestamp.getTime() / 1000), $lt: ObjectId.createFromTime(endTimestamp.getTime() / 1000) } },
            { _id: 0 }
        );
        if (batchDocs.length === 0) {
            const nextDoc = await mongoHelper.findNextDocument(collection, endTimestamp);
            if (nextDoc.length === 0) break;
            startTimestamp = nextDoc[0]._id.getTimestamp();
            continue;
        }
        batchProcessing(batchDocs, fieldTypeCounts);
        startTimestamp = endTimestamp;
    }

    const endTime_all = Date.now();
    const fullTime = (endTime_all - startTime_all) / 1000;
    console.log(`Time taken for all documents: ${fullTime.toFixed(2)} seconds`);

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-');
    const csvFileName = `dump/${collectionName}-${formattedDate}.csv`;

    const csvHelper = new CSVHelper(csvFileName);
    csvHelper.writeFieldCountsToCSV(fieldTypeCounts);

    const fieldTypeJson = generateFieldTypeJson(fieldTypeCounts);
    const jsonFileName = `dump/${collectionName}.json`;

    const classContent = generateTypeScriptInterfaces(fieldTypeJson, collectionName);
    saveTypeScriptInterfacesToFile(collectionName, classContent, 'dump');

    fs.writeFileSync(jsonFileName, JSON.stringify(fieldTypeJson, null, 2));
    console.log(`Field-type JSON saved to ${jsonFileName}`);
}