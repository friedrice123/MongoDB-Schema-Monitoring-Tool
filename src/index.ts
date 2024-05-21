import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import { ObjectId } from 'mongodb';
const dotenv = require('dotenv')
dotenv.config();

async function createIndexIfNotExists(collection: any): Promise<void> {
    try {
        await collection.createIndex({ _id: 1 });
    } catch (error) {
        console.error('Index creation failed:', error);
    }
}

function flattenDocument(doc: any, parentKey: string = '', sep: string = '.'): Record<string, string> {
    const items: Record<string, string> = {};
    for (const [key, value] of Object.entries(doc)) {
        const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
        if (value && typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                items[newKey] = 'array';
            } else {
                items[newKey] = 'object'; // include the parent object itself
                Object.assign(items, flattenDocument(value, newKey, sep));
            }
        } else {
            items[newKey] = typeof value;
        }
    }
    return items;
}

async function processDocuments(connectionString: string, dbName: string, collectionName: string) {
    const client = new MongoClient(connectionString);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await createIndexIfNotExists(collection);

    const totalDocuments = await collection.countDocuments();
    const fieldTypeCounts: Record<string, number> = {};
    const startTime_all = Date.now();

    let startTimestamp = new Date(0);  // Start from the epoch time
    const intervalWindow = 25 * 1000;  // Interval window in milliseconds

    while (true) {
        const endTimestamp = new Date(startTimestamp.getTime() + intervalWindow);

        const batchDocs = await collection
            .find({ _id: { $gt: ObjectId.createFromTime(startTimestamp.getTime() / 1000), $lt: ObjectId.createFromTime(endTimestamp.getTime() / 1000) } })
            .project({ _id: 0 })
            .toArray();

        if (batchDocs.length === 0) {
            // Find the next document after the current endTimestamp
            const nextDoc = await collection
                .find({ _id: { $gt: ObjectId.createFromTime(endTimestamp.getTime() / 1000) } })
                .sort({ _id: 1 })
                .limit(1)
                .toArray();

            if (nextDoc.length === 0) {
                break; // No more documents to process
            }

            // Update startTimestamp to the next document's timestamp
            startTimestamp = nextDoc[0]?._id?.getTimestamp() || new Date();
            continue; // Skip processing and continue with the new timestamp
        }

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

        // Update startTimestamp to the endTimestamp for the next batch
        startTimestamp = endTimestamp;
    }

    const endTime_all = Date.now();
    const fullTime = (endTime_all - startTime_all) / 1000;
    console.log(`Time taken for all documents: ${fullTime.toFixed(2)} seconds`);

    // Writing to CSV file
    const csvOutput = fs.createWriteStream('output.csv');
    csvOutput.write('Field,Data Type,Document Count\n');
    for (const [fieldType, count] of Object.entries(fieldTypeCounts)) {
        const [field, dataType] = fieldType.split(':');
        csvOutput.write(`${field},${dataType},${count}\n`);
    }

    await client.close();
}

const connectionString = process.env.CONNECTION_STRING ;
if (!connectionString) {
    throw new Error('Missing CONNECTION_STRING in environment variables');
}
const dbName = process.argv[2];
if (!dbName) {
    throw new Error('Please specify the database name');
}
const collectionName = process.argv[3];
if (!collectionName) {
    throw new Error('Please specify the collection name');
}

processDocuments(connectionString, dbName, collectionName).catch(error => console.error(error));
