import { MongoHelper } from './utils/mongoHelper';
import { flattenDocument } from './utils/flattenDocument';
import { ObjectId } from 'mongodb';
import { writeFieldCountsToCSV } from './utils/csvWriter';
require('dotenv').config();

async function processDocuments(connectionString: string, dbName: string, collectionName: string) {
    const mongoHelper = new MongoHelper(connectionString);
    await mongoHelper.connect();
    const collection = mongoHelper.getCollection(dbName, collectionName);

    await mongoHelper.createIndexIfNotExists(collection);
    const fieldTypeCounts: Record<string, number> = {};
    const startTime_all = Date.now();

    let startTimestamp = new Date(0);  // Start from the epoch time
    const intervalWindow = 25 * 1000;  // Interval window in milliseconds

    while (true) {
        const endTimestamp = new Date(startTimestamp.getTime() + intervalWindow);

        const batchDocs = await mongoHelper.findDocuments(
            collection,
            { _id: { $gt: ObjectId.createFromTime(startTimestamp.getTime() / 1000), $lt: ObjectId.createFromTime(endTimestamp.getTime() / 1000) } },
            { _id: 0 }
        );

        if (batchDocs.length === 0) {
            const nextDoc = await mongoHelper.findNextDocument(collection, endTimestamp);
            if (nextDoc.length === 0) {
                break; // No more documents to process
            }
            startTimestamp = nextDoc[0]._id.getTimestamp();
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

        startTimestamp = endTimestamp;
    }

    const endTime_all = Date.now();
    const fullTime = (endTime_all - startTime_all) / 1000;
    console.log(`Time taken for all documents: ${fullTime.toFixed(2)} seconds`);

    writeFieldCountsToCSV('output.csv', fieldTypeCounts);

    await mongoHelper.close();
}

const connectionString = process.env.CONNECTION_STRING;
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