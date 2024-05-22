// MongoHelper.ts
import { MongoClient, ObjectId, Collection } from 'mongodb';

export class MongoHelper {
    private client: MongoClient;

    constructor(connectionString: string) {
        this.client = new MongoClient(connectionString);
    }

    async connect(): Promise<void> {
        await this.client.connect();
    }

    async close(): Promise<void> {
        await this.client.close();
    }

    getCollection(dbName: string, collectionName: string): Collection {
        return this.client.db(dbName).collection(collectionName);
    }

    async createIndexIfNotExists(collection: Collection): Promise<void> {
        try {
            await collection.createIndex({ _id: 1 });
        } catch (error) {
            console.error('Index creation failed:', error);
        }
    }

    async findDocuments(
        collection: Collection,
        query: object,
        projection: object,
    ): Promise<any[]> {
        return collection.find(query).project(projection).toArray();
    }

    async findNextDocument(collection: Collection, timestamp: Date): Promise<any[]> {
        return collection
            .find({ _id: { $gt: ObjectId.createFromTime(timestamp.getTime() / 1000) } })
            .sort({ _id: 1 })
            .limit(1)
            .toArray();
    }
}


