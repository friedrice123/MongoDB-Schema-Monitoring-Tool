import { ObjectId } from 'mongodb';
import { MongoConnectionManager } from '../utils/mongoManager';
import { MONGO_IDENTIFIER } from '../config';

interface Config {
    dbName: string;
    collectionName: string;
    intervalWindow?: number;
    fieldName?: string;
    environment?: string;
}

export async function storeConfig(dbName: string, collectionName: string, response: Config): Promise<string> {
    const client = await MongoConnectionManager.getClient(MONGO_IDENTIFIER["AUDIT_DB"]);
    let uniqueID = '';
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        
        // Generate ObjectId for the document
        const objectId = new ObjectId();
        uniqueID = objectId.toHexString();

        // Assign ObjectId directly to _id field
        const configWithObjectId = {
            _id: objectId, // Assign ObjectId instance directly
            ...response
        };

        // Insert the document with the generated ObjectId
        await collection.insertOne(configWithObjectId);
        console.log(`Response with Object ID: ${objectId.toHexString()} has been inserted into ${collectionName}`);
    } catch (error) {
        console.error('Error inserting response:', error);
    } finally {
        await client.close();
    }
    return uniqueID
}
