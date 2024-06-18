import * as dotenv from 'dotenv';
dotenv.config();
export enum MONGO_IDENTIFIER {
    AUDIT_DB = 'AUDIT_DB',
    SCANNING_DB = 'SCANNING_DB',
}

export const auditdbName : string = process.env.AUDIT_DB_NAME!;
export const auditCollectionName : string = process.env.AUDIT_DB_COLLECTION_NAME!;
export const auditEnvironment : string = process.env.AUDIT_ENVIRONMENT!;

export const connectionStrings: Record<string, string> = {
    [MONGO_IDENTIFIER.AUDIT_DB]: process.env.AUDIT_DB_CONN_STRING!,
    [MONGO_IDENTIFIER.SCANNING_DB]: process.env.SCANNING_DB_CONN_STRING!
}