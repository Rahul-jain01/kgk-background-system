import { Client } from 'pg';
import { executeWithRetries } from "./utils";


// PostgreSQL client
const client = new Client({
    connectionString: process.env.DATABASE_URL + '?application_name=medusa_child',
});

const RETRY_DELAY = 3000; // milliseconds

export { client as dataSource };