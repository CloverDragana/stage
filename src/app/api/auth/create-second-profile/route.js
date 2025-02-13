import postgresConnection from "@/lib/db";

export async function POST(req) {

    try {
        const body = await req.json();
        const { userId, profileType } = body;
        console.log (userId, profileType);

        if(!userId || !['personal', 'professional'].includes(profileType)){
            return new Response(JSON.stringify({error: 'User ID and Profile Type required to add additional profile'}), {status: 400});
        }

        const pgClient = await postgresConnection.connect();

        try{

            const checkUserId = userId;
            const checkProfileType = profileType;

            const secondProfileCheck = await pgClient.query(
                `SELECT * FROM profiles WHERE userid = $1 AND profile_type = $2`,
                [checkUserId, checkProfileType]    
            );
            console.log("Test 1");

            if(secondProfileCheck.rows.length > 0){
                return new Response(JSON.stringify({error: 'This profile type already exists'}), {status: 400});
            }

            await pgClient.query(
                `INSERT INTO profiles (userid, profile_type)
                VALUES ($1, $2)`,
                [userId, profileType]
            ); 
            console.log (userId, profileType);

            console.log("check fixing 31")

            const updateUserTable = profileType === 'personal' ? 'personal_account' : 'professional_account';

            await pgClient.query(
                `UPDATE users SET ${updateUserTable} = TRUE WHERE userid = $1`,
                [userId]
            );

            return new Response(JSON.stringify({message: 'New Profile successfully added'}), {status: 201});

        } finally {
            pgClient.release();
        }

    } catch (error) {
        console.error('Cannot create second profile type', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}