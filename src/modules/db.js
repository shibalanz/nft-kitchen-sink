import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

async function readDB(payloadType) {
    console.log(`Reading from db`);
    await db.read();
    // If file.json doesn't exist, db.data will be null so set default data
    db.data ||= { [payloadType]: [] };
    return db.data;
}

async function writeDB(payload, payloadType) {
    if (Array.isArray(payload))
        db.data[payloadType].push(...payload);
    else
        db.data[payloadType].push(payload);
    await db.write();
}

export {
    readDB,
    writeDB,
};



