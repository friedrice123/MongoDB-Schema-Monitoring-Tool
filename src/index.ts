import { processDocuments } from './services/processDocuments';
import { MongoHelper } from './utils/mongoHelper';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { MONGO_IDENTIFIER, auditCollectionName, auditdbName, connectionStrings } from './config';
import { storeConfig } from './services/storeConfig';

const app: Express = express();
const port = 8000;
export let intervalWindow: number = 25 * 1000;  // Interval window in milliseconds
export let fieldName: string | undefined; // Field name collected from the 3rd argument

MongoHelper.createDbConnection(connectionStrings[MONGO_IDENTIFIER["SCANNING_DB"]]!);

app.use(bodyParser.json());

interface Config {
    dbName: string;
    collectionName: string;
    intervalWindow?: number;
    fieldName?: string;
}

interface Status {
    status: 'processing' | 'completed' | 'failed';
    error?: string;
}

const requestStatus: Record<string, Status> = {};

app.post("/buildSchema", async (req: Request, res: Response) => {
    const config: Config = req.body;
    const uniqueID = await storeConfig(auditdbName, auditCollectionName, config)
    requestStatus[uniqueID] = { status: 'processing' };

    if (config.intervalWindow) intervalWindow = config.intervalWindow;
    if (config.fieldName) fieldName = config.fieldName;

    processDocuments(connectionStrings[MONGO_IDENTIFIER["SCANNING_DB"]]!, config.dbName, config.collectionName, uniqueID)
        .then(() => {
            if (requestStatus[uniqueID]) {
                requestStatus[uniqueID]!.status = 'completed';
            }
        })
        .catch((error) => {
            requestStatus[uniqueID] = { status: 'failed', error: error.message };
        });

    res.json({ uniqueID, config });
    
});

app.get("/checkStatus/", (req: Request, res: Response) => {
    const { id } = req.query;
    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing id query parameter' });
    }
    const status = requestStatus[id];
    if (status) {
        res.json(status);
    } else {
        res.status(404).json({ error: 'Invalid ID' });
    }
});

app.get("/download/", (req: Request, res: Response) => {
    const { id } = req.query;
    res.download(`dump/${id}.zip`, `${id}.zip`, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
