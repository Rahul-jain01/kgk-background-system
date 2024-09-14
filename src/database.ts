import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// PostgreSQL client
export const dataSource = new Client({
    connectionString: process.env.DATABASE_URL,
});


// Connect to the PostgreSQL database
export async function connectDataSource() {
    try {
        console.log(process.env.DATABASE_URL)
        await dataSource.connect();
        console.log('Connected to the database');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

// Disconnect the DataSource
export async function disconnectDataSource() {
    try {
        await dataSource.end();
        console.log('Disconnected from the database');
    } catch (err) {
        console.error('Error disconnecting from the database:', err);
    }
}
