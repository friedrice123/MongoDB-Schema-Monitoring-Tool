import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import {connectionStrings, MONGO_IDENTIFIER} from '../config';

dotenv.config();

export class MongoConnectionManager {
    private static instances: Record<string, MongoClient> = {};

    // private static createClient(connectionString: string): MongoClient {
    //     return new MongoClient(connectionString);
    // }

    static async getClient(identifier: string): Promise<MongoClient> {
        if (this.instances[identifier]!) {
            this.instances[identifier]!.connect();
            return this.instances[identifier]!;
        }
        else{
            const connectionString = connectionStrings[identifier];
            if (!connectionString) {
                throw new Error(`Connection string for ${identifier} not found`);
            }
            const client = new MongoClient(connectionString);
            await client.connect();
            this.instances[identifier]= client;
            return this.instances[identifier]!;
        }
    }

    static async closeAllConnections() {
        for (const [identifier, client] of Object.entries(this.instances)) {
            await client.close();
        }
    }

    static async closeConnection(identifier: MONGO_IDENTIFIER) {
        const client = this.instances[identifier];
        if (client) {
            await client.close();
        }
    }
}

// Example usage:
// const client1 = await MongoManager.getClient(MONGO_IDENTIFIER.DB1);
// const client2 = await MongoManager.getClient(MONGO_IDENTIFIER.DB2);
// await MongoManager.closeConnection(MONGO_IDENTIFIER.DB1);
// await MongoManager.closeAllConnections();
