import { processDocuments } from './utils/processDocuments';
import { connectionString, dbName, collectionName} from './config';


async function main() {
    if (!connectionString) {
        throw new Error('Missing CONNECTION_STRING in environment variables');
    }
    
    if (!dbName) {
        throw new Error('Please specify the database name');
    }
    
    if (!collectionName) {
        throw new Error('Please specify the collection name');
    }
    await processDocuments(connectionString, dbName, collectionName);
}

main()