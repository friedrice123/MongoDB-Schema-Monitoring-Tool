export const connectionString : string = process.env.CONNECTION_STRING!;
export const dbName : string = process.argv[2]!;
export const collectionName : string = process.argv[3]!;
export let intervalWindow : number = 25 * 1000;  // Interval window in milliseconds
