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

        const body =  await req.json();
        const { fName, lName, gender, email, dob} = body.formData;
        console.log({fName, lName, gender, email, dob});

        const authenticatedUserId = session.user.id;
        // const hashedPassword = password ? await hash(password, 10) : null;

        const query = `
            UPDATE users
            SET fName = COALESCE(NULLIF($1, ''), fName),
                lName = COALESCE(NULLIF($2, ''), lName),
                gender = COALESCE(NULLIF($3, ''), gender),
                email = COALESCE(NULLIF($4, ''), email),
                dob = COALESCE(NULLIF($5, '')::date, dob)
            WHERE userid = $6
            RETURNING *;
        `;

        const values = [fName, lName, gender, email, dob, authenticatedUserId];
        const dbQuery = await postgresConnection.query(query, values);

        if(dbQuery.rowCount === 0){
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        const updatedUser = dbQuery.rows[0];
        console.log("Updated user:", updatedUser);


        return new Response(JSON.stringify({ 
            message: 'Profile updated successfully!',
            user: updatedUser }),
            { status: 200 });
    } catch (error){
        console.error("Updating user info unsuccessful", error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
