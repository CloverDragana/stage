// import { Pool } from 'pg';

// const postgresConnection = new Pool({
//     user: process.env.NEXT_PUBLIC_PGUSER,
//     host: process.env.NEXT_PUBLIC_PGHOST,
//     database: process.env.NEXT_PUBLIC_PGDATABASE,
//     password: process.env.NEXT_PUBLIC_PGPASSWORD,
//     port: process.env.NEXT_PUBLIC_PGPORT,
// });

// export default postgresConnection;


import { Pool } from 'pg';

const postgresConnection = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: true
    }
});

export default postgresConnection;