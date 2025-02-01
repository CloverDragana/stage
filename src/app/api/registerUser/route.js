import { Pool } from 'pg';

const pool = new Pool ({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

export async function POST(req){
    // if (req.method === 'POST') {
    //     const formData = req.body;

        // if (!formData.fName || !formData.lName || !formData.email || !formData.username || !formData.password) {
        //     return res.status(400).json({ error: 'All fields are required register user file' });
        // }

        try {

            const body = await req.json();
            // await pool.connect();

            if (!body.fName || !body.lName || !body.email || !body.username || !body.password) {
                return new Response(JSON.stringify({ error: 'All fields are required register user file' }), {status:400});
            }

            const fullName = `${body.fName} ${body.lName}`

            const result = await pool.query(
                `INSERT INTO users (fullName, email, username, password)
                VALUES ($1, $2, $3, $4) RETURNING UserID`,
                [fullName, body.email, body.username, body.password]
            );

            // res.status(201).json({
            //     message: 'User successfully registered',
            //     userId: result.rows[0].UserID,
            // });
            return new Response(JSON.stringify({
                message: 'user successfully registered',
                userId: result.rows[0].userId,
            }), {status: 201});
        } catch (error){

            console.error('databse query error', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    // } else {
    //     res.setHeader('Allow', ['POST']);
    //     res.status(405).end('Method ${req.method} Not Allowed');
    // }
}