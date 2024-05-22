import * as fs from 'fs';

export function writeFieldCountsToCSV(filePath: string, fieldTypeCounts: Record<string, number>): void {
    const csvOutput = fs.createWriteStream(filePath);
    csvOutput.write('Field,Data Type,Document Count\n');
    for (const [fieldType, count] of Object.entries(fieldTypeCounts)) {
        const [field, dataType] = fieldType.split(':');
        csvOutput.write(`${field},${dataType},${count}\n`);
    }
}
