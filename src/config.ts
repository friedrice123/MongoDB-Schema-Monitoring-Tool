import * as dotenv from 'dotenv';
// delete process.env.SCANNING_DB_CONN_STRING;
// delete process.env.AUDIT_DB_CONN_STRING;
dotenv.config();
export enum MONGO_IDENTIFIER {
    AUDIT_DB = 'AUDIT_DB',
    SCANNING_DB = 'SCANNING_DB',
}


export const connectionStrings: Record<string, string> = {
    [MONGO_IDENTIFIER.AUDIT_DB]: process.env.AUDIT_DB_CONN_STRING!,
    [MONGO_IDENTIFIER.SCANNING_DB]: process.env.SCANNING_DB_CONN_STRING!
}