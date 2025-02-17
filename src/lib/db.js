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
    connectionString: "postgres://neondb_owner:npg_vVf9torjkU6O@ep-sweet-cake-a2l3hl14-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    ssl: {
        require: true,
        rejectUnauthorized: true
    }
});

export default postgresConnection;