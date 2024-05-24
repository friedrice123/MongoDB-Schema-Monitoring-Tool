import { MongoClient, ObjectId, Collection } from 'mongodb';

export let mongoClient : MongoClient;
export class MongoHelper {
    private client: MongoClient;
    // Construct a client for the instance
    constructor(connectionString: string) {
        this.client = new MongoClient(connectionString);
        mongoClient = this.client;
    }
    // Create a connection to the MongoDB instance
    static async createDbConnection(connectionString: string) {
        const mongoHelper = new MongoHelper(connectionString);
        await mongoHelper.client.connect();
        mongoClient = mongoHelper.client;
        return mongoHelper.client;
    }
    // Close the connection to the MongoDB instance
    static async closeDbConnection() {
        if (mongoClient) {
            console.log('Closing DB connection...');
            await mongoClient.close();
            console.log('DB connection closed');
        } else {
            console.log('No DB connection to close');
        }
    }
    // Get a collection from the database
    async getCollection(dbName: string, collectionName: string): Promise<Collection> {
        return this.client.db(dbName).collection(collectionName);
    }
    // Find documents in the collection based on the query and projection
    async findDocuments(collection: Collection, query: object, projection: object)  : Promise<any[]> {
        return collection.find(query).project(projection).toArray();
    }
    // Find the next document in the collection based on the timestamp
    async findNextDocument(collection: Collection, timestamp: Date): Promise<any[]> {
        return collection
            .find({ _id: { $gt: ObjectId.createFromTime(timestamp.getTime() / 1000) } })
            .sort({ _id: 1 })
            .limit(1)
            .toArray();
    }
}