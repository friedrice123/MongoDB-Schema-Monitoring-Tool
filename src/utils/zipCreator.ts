import fs from 'fs';
import archiver from 'archiver';

export async function createZipFile(folderPath: string): Promise<void> {
    const output = fs.createWriteStream(`${folderPath}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            console.log(`Zip file created: ${folderPath}.zip (${archive.pointer()} total bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            console.error(`Error creating zip file: ${err}`);
            reject(err);
        });

        archive.pipe(output);
        archive.directory(folderPath, false);
        archive.finalize();
    });
}