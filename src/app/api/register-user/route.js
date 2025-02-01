import pool from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.fName || !body.lName || !body.email || !body.username || !body.password) {
            return new Response(JSON.stringify({ error: 'All fields are required register user file' }), { status: 400 });
        }

        const fullName = `${body.fName} ${body.lName}`;

        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO users (fullname, email, username, password)
                VALUES ($1, $2, $3, $4) RETURNING userid`,
                [fullName, body.email, body.username, body.password]
            );

            return new Response(JSON.stringify({
                message: 'User successfully registered',
                userId: result.rows[0].UserID,
            }), { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Database query error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}