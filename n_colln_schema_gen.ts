import { MongoClient } from 'mongodb';
import * as fs from 'fs';

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
    const batchSize = 1000;
    const fieldTypeCounts: Record<string, number> = {};
    const startTime_all = Date.now();
    for (let i = 0; i < totalDocuments; i += batchSize) {
        const startTime = Date.now();

        const cursor = collection.find({}).skip(i).limit(batchSize).project({ _id: 0 });
        const batchDocs = await cursor.toArray();

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

        const endTime = Date.now();
        const iterationTime = (endTime - startTime) / 1000;
        console.log(`Time taken for batch starting at ${i}: ${iterationTime.toFixed(2)} seconds`);
    }
    const endTime_all = Date.now();
    const fullTime = (endTime_all - startTime_all) / 1000;
    console.log(`Time taken for all documents: ${fullTime.toFixed(2)} seconds`);
    const threshold = 0;
    const thresholdFieldTypes: string[] = [];

    // Writing to CSV file
    const csvOutput = fs.createWriteStream('output.csv');
    csvOutput.write('Field,Data Type,Document Count\n');
    for (const [fieldType, count] of Object.entries(fieldTypeCounts)) {
        const [field, dataType] = fieldType.split(':');
        const percentage = count / totalDocuments;
        if (percentage >= threshold) {
            csvOutput.write(`${field},${dataType},${count}\n`);
        }
    }

    await client.close();
}

const dbName = 'sample_mflix';
const collectionName = 'movies';

processDocuments(dbName, collectionName).catch(error => console.error(error));
