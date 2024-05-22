import * as fs from 'fs';
import * as Papa from 'papaparse';

export class CSVHelper {
    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    writeFieldCountsToCSV(fieldTypeCounts: Record<string, number>): void {
        const data = [['Field', 'Data Type', 'Document Count']];
        for (const [fieldType, count] of Object.entries(fieldTypeCounts)) {
            const splitIndex = fieldType.indexOf(':');
            if (splitIndex === -1) {
                console.error(`Invalid fieldType format: ${fieldType}`);
                continue;
            }

            const field = fieldType.substring(0, splitIndex);
            const dataType = fieldType.substring(splitIndex + 1);
            data.push([field, dataType, count.toString()]);
        }

        const csv = Papa.unparse(data);
        fs.writeFileSync(this.filePath, csv, 'utf8');
    }

    readCSV(): Record<string, number>[] {
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
