import { processDocuments } from './utils/processDocuments';
import { connectionString, dbName, collectionName} from './config';
import { mongoClient, MongoHelper } from './utils/mongoHelper';


async function main() {
    await MongoHelper.createDbConnection(connectionString);
    await processDocuments(connectionString, dbName, collectionName);
    await mongoClient.close();
}

main()