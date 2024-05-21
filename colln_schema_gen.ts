import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import { ObjectId } from 'mongodb';

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

async function processDocuments(dbName: string, collectionName: string) {
    const client = new MongoClient('mongodb+srv://admin:awesome@cluster0.kzdrfb1.mongodb.net/');
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await createIndexIfNotExists(collection);

    const totalDocuments = await collection.countDocuments();
    const fieldTypeCounts: Record<string, number> = {};
    const startTime_all = Date.now();

    const allDocs = await collection.find({}).project({ _id: 1 }).toArray();

    // Extract timestamps from ObjectID and sort documents
    const docsWithTimestamp = allDocs.map(doc => ({
        _id: doc._id,
        timestamp: doc._id.getTimestamp(),
    })).sort((a, b) => a.timestamp - b.timestamp);

    let batchStartTime = docsWithTimestamp[0].timestamp;
    let batchDocs = [];

    for (const docWithTimestamp of docsWithTimestamp) {
        const docCreationTime = docWithTimestamp.timestamp;
        const intervalWindow = 25;
        if ((docCreationTime - batchStartTime) / 1000 <= intervalWindow) {
            batchDocs.push(docWithTimestamp._id);
        } else {
            await processBatch(collection, batchDocs, fieldTypeCounts);
            batchStartTime = docCreationTime;
            batchDocs = [docWithTimestamp._id];
        }
    }

    if (batchDocs.length > 0) {
        await processBatch(collection, batchDocs, fieldTypeCounts);
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

async function processBatch(collection: any, batchDocs: any[], fieldTypeCounts: Record<string, number>) {
    const cursor = collection.find({ _id: { $in: batchDocs } }).project({ _id: 0 });
    const batchDocsArray = await cursor.toArray();

    for (const doc of batchDocsArray) {
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

const dbName = 'sample_mflix';
const collectionName = 'testing_schema';

processDocuments(dbName, collectionName).catch(error => console.error(error));
