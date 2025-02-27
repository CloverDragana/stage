// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../[...nextauth]/route";
// import postgresConnection from "@/lib/db";

// export async function PUT(req) {

//     try {
//         const session = await getServerSession(authOptions);
//         console.log(session);
//         if (!session) {
//             return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
//                 status: 401 
//             });
//         }

//         const body = await req.json();
//         const {userId, profileType, creativeSlogan, bio } = body;

//         if (!userId || !profileType){
//             return new Response(JSON.stringify({error: "UserId and Profile Type are required"}), {status: 400})
//         }

//         const dbClient = await postgresConnection.connect();
//         try {
//             const updateProfileData = await dbClient.query(
//                 `UPDATE profiles SET
//                     creative_slogan = $1,
//                     bio = $2
//                 WHERE userid = $3 and profile_type = $4
//                 RETURNING *`,
//                 [creativeSlogan, bio, userId, profileType]
//             );

//             if (updateProfileData.rows.length === 0){
//                 return new Response(JSON.stringify({error: "Profile not found"}), {status: 404})
//             }

//             return new Response(JSON.stringify({
//                 message: "Profile data successfully updated!",
//                 creativeSlogan,
//                 bio
//             }), { status: 200 });

//         } finally {
//             dbClient.release();
//         }
    
//     } catch (error) {
//         console.log("Error updating profile data");
//         return new Response(JSON.stringify({error: "Error updating profile data" }), {status : 500});
//     }

// }