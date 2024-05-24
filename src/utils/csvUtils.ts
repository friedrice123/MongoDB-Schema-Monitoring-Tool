import * as fs from 'fs';
import * as Papa from 'papaparse';

export class CSVHelper {
    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }
    // Write the field counts to a CSV file
    async writeFieldCountsToCSV(fieldTypeCounts: Record<string, number>){
        const data = [['Field', 'Data Type', 'Document Count']];
        for (const [fieldType, count] of Object.entries(fieldTypeCounts)) {
            let [field, dataType] = fieldType.split(':');
            if(dataType != undefined && dataType[0] === '{'){
                let i = 0;
                while(i < fieldType.length && fieldType[i] !== '{'){
                    i++;
                }
                dataType = fieldType.slice(i);
            }
            data.push([field!, dataType!, count.toString()]);
        }

        const csv = Papa.unparse(data);
        fs.writeFileSync(this.filePath, csv, 'utf8');
    }
    // Read the CSV file
    async readCSV(): Promise<Record<string, number>[]> {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        const result = Papa.parse<Record<string, number>>(fileContent, {
            header: true,
            dynamicTyping: true,
        });

        if (result.errors.length) {
            console.error('Error parsing CSV:', result.errors);
        }

        return result.data;
    }
}
