import postgresConnection from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);

        if(!session) {
            return new Response(JSON.stringify({ message: 'Unauthorised access to page' }), { status: 401 });
        }

        const userEmail = session.user.email;
        const dbClient = await postgresConnection.connect();

        try {
            const query = `
                DELETE FROM users
                WHERE email = $1
                RETURNING *;
            `;
            const dbQuery = await dbClient.query(query, [userEmail]);

            if(dbQuery.rowCount === 0) {
                return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
            }

            // Clear session cookie
            return new Response(JSON.stringify({ message: 'Account deleted successfully' }), { 
                status: 200,
                headers: {
                    'Set-Cookie': 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
                }
            });
        } finally {
            dbClient.release();
        }
    } catch (error) {
        console.error("Error deleting user", error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}