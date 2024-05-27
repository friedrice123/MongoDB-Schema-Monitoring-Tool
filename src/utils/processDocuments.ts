import { MongoHelper } from './mongoHelper';
import { ObjectId } from 'mongodb';
import { CSVHelper } from './csvUtils';
import { generateTypeScriptInterfaces, saveTypeScriptInterfacesToFile } from './generateInterfaceDefinition';
import { generateFieldTypeJson } from './generateJSON';
import { fieldName, intervalWindow } from '../config';
import fs from 'fs';
import { batchProcessing } from './batchProcessing';

export async function processDocuments(connectionString: string, dbName: string, collectionName: string) {
    const mongoHelper = new MongoHelper(connectionString);
    const collection  = await mongoHelper.getCollection(dbName, collectionName);
    // Find information about the whole collection scanning documents in batches made according to their creation timestamp intervals
    const fieldTypeCounts: Record<string, number> = {};
    const docsWithField: Record<string, Record<string, string>[]> = {};
    const startTime_all = Date.now();
    let startTimestamp = new Date(0);  // Start from the epoch time
    while (true) {
        const endTimestamp = new Date(startTimestamp.getTime() + intervalWindow);
        // Extraction query for the batch of documents
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
        // Collect information about the fields, their types and number of documents they appear in
        await batchProcessing(batchDocs, fieldTypeCounts, docsWithField);
        startTimestamp = endTimestamp;
    }
    if(docsWithField){
        const jsonFileName = `dump/${collectionName}_${fieldName}.json`;
        fs.writeFileSync(jsonFileName, JSON.stringify(docsWithField, null, 2));
    }
    console.log(docsWithField);
    const endTime_all = Date.now();
    const fullTime = (endTime_all - startTime_all) / 1000;
    console.log(`Time taken for all documents: ${fullTime.toFixed(2)} seconds`);
    // Save the information about the fields and their types to a CSV file
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-');
    const csvFileName = `dump/${collectionName}-${formattedDate}.csv`;
    const csvHelper = new CSVHelper(csvFileName);
    await csvHelper.writeFieldCountsToCSV(fieldTypeCounts);
    // Save the information about the fields and their types to a JSON file
    const fieldTypeJson = await generateFieldTypeJson(fieldTypeCounts);
    const jsonFileName = `dump/${collectionName}.json`;
    fs.writeFileSync(jsonFileName, JSON.stringify(fieldTypeJson, null, 2));
    console.log(`Field-type JSON saved to ${jsonFileName}`);
    // Generate TypeScript interfaces based on the information about the fields and their types
    const classContent = await generateTypeScriptInterfaces(fieldTypeJson, collectionName);
    saveTypeScriptInterfacesToFile(collectionName, classContent, 'dump');    
}