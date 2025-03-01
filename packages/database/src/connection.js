import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

console.log("Initializing database connection with:", {
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    // Don't log sensitive info like password
});

console.log("Database module loaded");

const db = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

// Test connection on module load 
const testConnection = async () => {
  try {
    const client = await db.connect();
    console.log("Test database connection successful");
    client.release();
  } catch (error) {
    console.error("Test database connection failed:", error);
  }
};

testConnection();

export default db;


// import { Pool } from 'pg';

// const postgresConnection = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         require: true,
//         rejectUnauthorized: true
//     }
// });

// export default postgresConnection;