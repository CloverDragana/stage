import postgresConnection from '@/lib/db';
import bcrypt from 'bcryptjs';
import { compare } from 'bcryptjs';

export async function POST(req) {
    try {

        const loginDetails = await req.json();
        const {username, password} = loginDetails;

        if(!username || !password){
            return new Response(JSON.stringify({error: 'Username and Password required to log in'}), {status: 400});
        }

        const dbClient = await postgresConnection.connect();

        try{
            const dbQuery = await dbClient.query(
                `SELECT * FROM users WHERE username = $1`, [username]
            );

            if (dbQuery.rows.length === 0){
                return new Response(JSON.stringify({error: 'User not found'}), {status: 404});
            }
            
            const user = dbQuery.rows[0];
            const passwordCorrect = await compare(password, user.password);

            if (!passwordCorrect){
                return new Response(JSON.stringify({error: 'Password incorrect'}), {status: 401});
            }
            
            return new Response(JSON.stringify({
                message: 'Now logged in!',
                userId: user.userId,
            }), {status: 200});
        } finally {
            dbClient.release();
        }
    } catch (error){
        console.error('Database error', error);
        return new Response(JSON.stringify({error: 'Internal server error'}), {status: 500});
    }
}