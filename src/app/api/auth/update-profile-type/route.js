import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import postgresConnection from "@/lib/db";

export async function POST(req) {
    console.log("🔹 API HIT: update-profile-type"); // Debug log
    try {
        const session = await getServerSession(authOptions);
        console.log(session);
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

            const checkIsProfileTrue = await dbClient.query(
                `SELECT personal_account, professional_account 
                FROM users 
                WHERE userid = $1;`,
                [session.user.id]
            )

            const userProfile = checkIsProfileTrue.rows[0];

            if (!userProfile){
                return new Response(JSON.stringify({error: "user not found"}), {status : 404});
            }

            const hasProfile = profileType === 'personal' ? userProfile.personal_account : userProfile.professional_account;

            if (!hasProfile) {
                console.log(" route file User does not have profile type created:", profileType);
                return new Response(JSON.stringify({ profileExists: false }), { status: 200 });
            }

            await dbClient.query(
                'UPDATE users SET profile_type = $1 WHERE userid = $2',
                [profileType, session.user.id]
            );

            return new Response(JSON.stringify({ 
                message: 'Profile type updated successfully',
                profileType,
                profileExists : true 
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