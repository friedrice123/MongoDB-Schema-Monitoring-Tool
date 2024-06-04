import * as dotenv from 'dotenv';
delete process.env.CONNECTION_STRING;
dotenv.config();
export let connectionString : string = process.env.CONNECTION_STRING!; // Update this in .env file