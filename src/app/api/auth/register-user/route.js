import postgresConnection from '@/lib/db';
import { hash } from 'bcryptjs';

export default async function PUT(req, res) {
   if (req.method !== 'POST') {
        const {username, password, email, fname, lname, profileType} = req.body;

        const dbClient = await postgresConnection.connect();
   
        try {
            // const signUpInfo = await req.json();

            // if (!signUpInfo.fName || !signUpInfo.lName || !signUpInfo.email || !signUpInfo.username || !signUpInfo.password) {
            //     return new Response(JSON.stringify({ error: 'All fields are required register user file' }), { status: 400 });
            // }
            // console.log({signUpInfo});

            const hashedPwd = await hash(password, 10);

            const userQuery = await pgClient.query(
                `INSERT INTO users (fname, lname, email, username, password, personal_account, professional_account)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING userid`,
                [username, hashedPwd, email, fname, lname, profileType === 'personal', profileType === 'professional']);

            return new Response(JSON.stringify({
                message: 'User successfully registered',
                userId: userQuery.rows[0].userid, //.userId
                redirectUrl: "/profile"
            }), { status: 201 });
        } catch (error) {
            console.error('Database query error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        } finally {
            pgClient.release();
        }
    } else {
        return new Response(JSON.stringify({ error: 'Invalid request method' }), { status: 405 });
    }
}
