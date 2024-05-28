export const connectionString : string = process.env.CONNECTION_STRING!; // Update this in .env file
export let dbName : string = process.argv[2]!; // Database name collected from the 1st argument
export let collectionName : string = process.argv[3]!; // Collection name collected from the 2nd argument