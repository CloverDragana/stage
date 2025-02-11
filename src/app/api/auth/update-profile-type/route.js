import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import postgresConnection from "@/lib/db";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
                status: 401 
            });
        }

        const { profileType } = await req.json();
        if (!profileType || !['personal', 'professional'].includes(profileType)) {
            return new Response(JSON.stringify({ error: 'Invalid profile type' }), { 
                status: 400 
            });
        }

        const dbClient = await postgresConnection.connect();
        try {
            await dbClient.query(
                'UPDATE users SET profile_type = $1 WHERE userid = $2',
                [profileType, session.user.id]
            );

            return new Response(JSON.stringify({ 
                message: 'Profile type updated successfully',
                profileType 
            }), { status: 200 });
        } finally {
            dbClient.release();
        }
    } catch (error) {
        console.error('Error updating profile type:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { 
            status: 500 
        });
    }
}