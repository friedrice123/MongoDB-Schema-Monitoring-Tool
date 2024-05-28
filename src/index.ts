import { processDocuments } from './utils/processDocuments';
import { MongoHelper } from './utils/mongoHelper';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { connectionString } from './config';

const app: Express = express();
const port = 8000;
export let intervalWindow : number = 25*1000;  // Interval window in milliseconds
export let fieldName : string | undefined; // Field name collected from the 3rd argument

MongoHelper.createDbConnection(connectionString);
app.use(bodyParser.json());

interface Config {
    dbName: string;
    collectionName: string;
    intervalWindow?: number;
    fieldName?: string;
}

app.get("/", (req: Request, res: Response) => {
    res.send('Hello World');
});

app.post("/start-process", async (req: Request, res: Response) => {
    const config: Config = req.body;
    const uniqueID = uuidv4();
    if (config.intervalWindow) intervalWindow = config.intervalWindow;
    if (config.fieldName) fieldName = config.fieldName;
    processDocuments(connectionString, config.dbName, config.collectionName, uniqueID);
    res.json({ uniqueID });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
