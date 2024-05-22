export const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
    throw new Error('Missing CONNECTION_STRING in environment variables');
}

export const dbName = process.argv[2];
if (!dbName) {
    throw new Error('Please specify the database name');
}

export const collectionName = process.argv[3];
if (!collectionName) {
    throw new Error('Please specify the collection name');
}
