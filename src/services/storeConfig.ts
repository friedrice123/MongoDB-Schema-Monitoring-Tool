import { MongoClient } from 'mongodb';

interface Config {
    uniqueID: string;
    config: {
        dbName: string;
        collectionName: string;
        intervalWindow?: number;
        fieldName?: string;
    };
}

export async function storeConfig(connectionString: string, dbName: string, collectionName: string, response: Config): Promise<void> {
    const client = new MongoClient(connectionString);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        await collection.insertOne(response);
        console.log(`Response with ID: ${response.uniqueID} has been inserted into ${collectionName}`);
    } catch (error) {
        console.error('Error inserting response:', error);
    } finally {
        await client.close();
    }
}
