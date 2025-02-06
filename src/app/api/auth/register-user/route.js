import postgresConnection from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(req) {
    try {
        const signUpInfo = await req.json();

        if (!signUpInfo.fName || !signUpInfo.lName || !signUpInfo.email || !signUpInfo.username || !signUpInfo.password) {
            return new Response(JSON.stringify({ error: 'All fields are required register user file' }), { status: 400 });
        }
        console.log({signUpInfo});

        // const fullName = `${signUpInfo.fName} ${signUpInfo.lName}`;
        const hashedPwd = await hash(signUpInfo.password, 10);

        const pgClient = await postgresConnection.connect();

        try {
            const dbQuery = await pgClient.query(
                `INSERT INTO users (fname, lname, email, username, password)
                VALUES ($1, $2, $3, $4, $5) RETURNING userid`,
                [signUpInfo.fName, signUpInfo.lName, signUpInfo.email, signUpInfo.username, hashedPwd]
            );

            return new Response(JSON.stringify({
                message: 'User successfully registered',
                userId: dbQuery.rows[0].userid, //.userId
                redirectUrl: "/profile"
            }), { status: 201 });
        } finally {
            pgClient.release();
        }
    } catch (error) {
        console.error('Database query error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}