import { MongoClient, ObjectId, Collection } from 'mongodb';

export let mongoClient : any;
export class MongoHelper {
    private client: MongoClient;

    constructor(connectionString: string) {
        this.client = new MongoClient(connectionString);
        mongoClient = this.client;
    }

    static async createDbConnection(connectionString : string){
        const mongoHelper = new MongoHelper(connectionString);
        await mongoHelper.client.connect();
        return mongoHelper.client;
    }

    getCollection(dbName: string, collectionName: string): Collection {
        return this.client.db(dbName).collection(collectionName);
    }

    async findDocuments(collection: Collection, query: object, projection: object)  : Promise<any[]> {
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