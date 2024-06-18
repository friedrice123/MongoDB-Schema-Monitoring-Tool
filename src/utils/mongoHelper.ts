import { MongoClient, ObjectId, Collection } from 'mongodb';

export let mongoClient: MongoClient;
export class MongoHelper {
    private client: MongoClient;

    // Construct a client for the instance
    constructor(connectionString: string) {
        this.client = new MongoClient(connectionString);
        mongoClient = this.client;
    }

    // Create a connection to the MongoDB instance
    static async createDbConnection(connectionString: string) {
        try {
            const mongoHelper = new MongoHelper(connectionString);
            await mongoHelper.client.connect();
            mongoClient = mongoHelper.client;
            return mongoHelper.client;
        } catch (error) {
            console.error('Error creating DB connection:', error);
            throw new Error('Failed to create DB connection');
        }
    }

    // Close the connection to the MongoDB instance
    static async closeDbConnection() {
        if (mongoClient) {
            try {
                console.log('Closing DB connection...');
                await mongoClient.close();
                console.log('DB connection closed');
            } catch (error) {
                console.error('Error closing DB connection:', error);
                throw new Error('Failed to close DB connection');
            }
        } else {
            console.log('No DB connection to close');
        }
    }

    // Get a collection from the database
    async getCollection(dbName: string, collectionName: string): Promise<Collection> {
        try {
            return this.client.db(dbName).collection(collectionName);
        } catch (error) {
            console.error(`Error getting collection ${collectionName} from database ${dbName}:`, error);
            throw new Error('Failed to get collection');
        }
    }

    // Find documents in the collection based on the query and projection
    async findDocuments(collection: Collection, query: object, projection: object): Promise<any[]> {
        try {
            return collection.find(query).project(projection).toArray();
        } catch (error) {
            console.error('Error finding documents:', error);
            throw new Error('Failed to find documents');
        }
    }

    // Find the next document in the collection based on the timestamp
    async findNextDocument(collection: Collection, timestamp: Date): Promise<any[]> {
        try {
            return collection
                .find({ _id: { $gt: ObjectId.createFromTime(timestamp.getTime() / 1000) } })
                .sort({ _id: 1 })
                .limit(1)
                .toArray();
        } catch (error) {
            console.error('Error finding next document:', error);
            throw new Error('Failed to find next document');
        }
    }
    
}