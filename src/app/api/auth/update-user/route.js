import postgresConnection from '@/lib/db';
import { getServerSession} from "next-auth";
import {authOptions} from "../[...nextauth]/route";
import { hash } from 'bcryptjs';

export async function PUT(req){
    try{
        const session = await getServerSession(authOptions);

        if(!session){
            return new Response(JSON.stringify({ message: 'unauthorised access to page' }), { status: 401 });
        }

        const {
            fName, lName, gender, email, dob, password, userid
        } = await req.json();
        const userEmail = session.user.email;

        const hashedPassword = password ? await hash(password, 10) : null;

        const query = `
            UPDATE users
            SET fName = $1, lName = $2, gender = $3, email = $4, dob = $5, password = COALESCE($6, password)
            WHERE userid = $7
            RETURNING *;
        `;

        const values = [fName, lName, gender, email, dob, hashedPassword, userid];
        const dbQuery = await postgresConnection.query(query, values);

        if(dbQuery.rowCount === 0){
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }
        return new Response(JSON.stringify({ 
            message: 'Profile updated successfully!',
            userId: dbQuery.rows[0] }),
            { status: 200 });
    } catch (error){
        console.error("Updating user info unsuccessful", error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
