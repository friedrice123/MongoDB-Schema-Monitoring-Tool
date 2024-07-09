import { processDocuments } from './services/processDocuments';
import { MongoHelper } from './utils/mongoHelper';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { MONGO_IDENTIFIER, auditCollectionName, auditdbName, connectionStrings, auditEnvironment } from './config';
import { storeConfig } from './services/storeConfig';

const app: Express = express();
const port = 8001;

MongoHelper.createDbConnection(connectionStrings[MONGO_IDENTIFIER["SCANNING_DB"]]!);

app.use(bodyParser.json());

interface Config {
    dbName: string;
    collectionName: string;
    intervalWindow?: number;
    fieldName?: string;
    environment?: string;
}

interface Status {
    status: 'processing' | 'completed' | 'failed';
    error?: string;
}

const requestStatus: Record<string, Status> = {};

app.post("/buildSchema", async (req: Request, res: Response) => {
    const config: Config = req.body;

    if (!config.dbName || !config.collectionName) {
        return res.status(400).json({ error: 'Missing required fields: dbName and collectionName' });
    }

    if(typeof config.dbName != "string" || typeof config.collectionName != "string"){
        return res.status(400).json({ error: 'Please use string type for the config details'});
    }

    try {
        const uniqueID = await storeConfig(auditdbName, auditCollectionName, config);
        requestStatus[uniqueID] = { status: 'processing' };
        let intervalWindow: number = 25 * 1000; // Interval window in milliseconds
        let fieldName: string = ''; // Field name collected from the 3rd argument
        if (config.intervalWindow) intervalWindow = config.intervalWindow;
        if (config.fieldName) fieldName = config.fieldName;
        config.environment = auditEnvironment;

        processDocuments(connectionStrings[MONGO_IDENTIFIER["SCANNING_DB"]]!, config.dbName, config.collectionName, uniqueID, fieldName, intervalWindow)
            .then(() => {
                if (requestStatus[uniqueID]) {
                    requestStatus[uniqueID]!.status = 'completed';
                }
            })
            .catch((error) => {
                requestStatus[uniqueID] = { status: 'failed', error: error.message };
            });

        res.json({ uniqueID, config });
    } catch (error) {
        res.status(500).json({ error: 'Failed to store config or process documents', details: error });
    }
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
    if (typeof id !== 'string' || !id) {
        return res.status(400).json({ error: 'Invalid or missing id query parameter' });
    }
    res.download(`dump/${id}.zip`, `${id}.zip`, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

app.get("/", (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.post("/", (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});