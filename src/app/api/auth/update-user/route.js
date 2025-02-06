import postgresConnection from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function PUT(req){
    try{
        const session = await getServerSession(authOptions);

        if(!session){
            return new Response(JSON.stringify({ message: 'unauthorised access to page' }), { status: 401 });
        }

        const body = await req.json();
        const { fname, lname, gender, email, dob } = body;
        
        // Use sub from session since that's where we put the ID
        const authenticatedUserId = session.user.id;

        console.log("Session:", session);
        console.log("AuthenticatedUserId:", authenticatedUserId);
        console.log("Update data:", { fname, lname, gender, email, dob });

        const query = `
            UPDATE users
            SET fname = COALESCE(NULLIF($1, ''), fname),
                lname = COALESCE(NULLIF($2, ''), lname),
                gender = COALESCE(NULLIF($3, ''), gender),
                email = COALESCE(NULLIF($4, ''), email),
                dob = COALESCE(NULLIF($5, '')::date, dob)
            WHERE userid = $6
            RETURNING *;
        `;

        const values = [fname, lname, gender, email, dob, authenticatedUserId];
        const dbClient = await postgresConnection.connect();
        
        try {
            const dbQuery = await dbClient.query(query, values);
            
            if(dbQuery.rowCount === 0){
                return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
            }

            const updatedUser = dbQuery.rows[0];
            
            return new Response(JSON.stringify({ 
                message: 'Profile updated successfully!',
                user: updatedUser 
            }), { status: 200 });
            
        } finally {
            dbClient.release();
        }
    } catch (error){
        console.error("Update error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}