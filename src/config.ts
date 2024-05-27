export const connectionString : string = process.env.CONNECTION_STRING!; // Update this in .env file
export const dbName : string = process.argv[2]!; // Database name collected from the 1st argument
export const collectionName : string = process.argv[3]!; // Collection name collected from the 2nd argument
export let intervalWindow : number = 25 * 1000;  // Interval window in milliseconds
export let fieldName : string | undefined = process.argv[4]; // Field name collected from the 3rd argument