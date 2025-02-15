import postgresConnection from "@/lib/db";

export async function GET(req){

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const profileType = searchParams.get('profileType');

    try {

        // const body = await req.json();
        // const { userId, profileType } = body;

        if(!userId || !['personal', 'professional'].includes(profileType)){
            return new Response(JSON.stringify({error: 'User ID and Profile Type required to add additional profile'}), {status: 400});
        }

        const pgClient = await postgresConnection.connect();

        try {
            const getProfileData = await pgClient.query(
                'SELECT * FROM profiles WHERE userid = $1 and profile_type = $2',
                [userId, profileType]
            );

            if (getProfileData.rows.length === 0){
                return new Response(JSON.stringify({error: "Profile data not found"}), {status : 404})
            }

            const profileData = getProfileData.rows[0];

            return new Response(JSON.stringify({ 
                message: 'Profile type updated successfully',
                profilePicture : profileData.profile_picture,
                creativeSlogan : profileData.creative_slogan,
                bio : profileData.bio, 
            }), { status: 200 });
        } finally{
            pgClient.release();
        }
        

    } catch (error) {
        console.log("Failed to get data from profiles table")
        return new Response(JSON.stringify({error: "Error getting data from database"}), {status: 500});
    }
}