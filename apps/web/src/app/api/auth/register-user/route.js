// import postgresConnection from '@/lib/db';
// import { hash } from 'bcryptjs';

// export async function POST(req) {
//     try {
//         const signUpInfo = await req.json();

//         if (!signUpInfo.fName || !signUpInfo.lName || !signUpInfo.email || 
//             !signUpInfo.username || !signUpInfo.password || !signUpInfo.profileType) {
//             return new Response(JSON.stringify({ 
//                 error: 'All fields are required register user file' 
//             }), { status: 400 });
//         }

//         console.log('Registration info:', {
//             ...signUpInfo,
//             password: '[REDACTED]' // Don't log the password
//         });

//         const hashedPwd = await hash(signUpInfo.password, 10);
//         const pgClient = await postgresConnection.connect();

//         try {
//             // First check if email or username already exists
//             const existingUser = await pgClient.query(
//                 'SELECT email, username FROM users WHERE email = $1 OR username = $2',
//                 [signUpInfo.email, signUpInfo.username]
//             );

//             if (existingUser.rows.length > 0) {
//                 const user = existingUser.rows[0];
//                 if (user.email === signUpInfo.email) {
//                     return new Response(JSON.stringify({ 
//                         error: 'Email already registered' 
//                     }), { status: 400 });
//                 }
//                 if (user.username === signUpInfo.username) {
//                     return new Response(JSON.stringify({ 
//                         error: 'Username already taken' 
//                     }), { status: 400 });
//                 }
//             }

//             const createUser = await pgClient.query(
//                 `INSERT INTO users (
//                     fname, lname, email, username, password, 
//                     profile_type, personal_account, professional_account
//                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
//                 RETURNING userid`,
//                 [
//                     signUpInfo.fName,
//                     signUpInfo.lName,
//                     signUpInfo.email,
//                     signUpInfo.username,
//                     hashedPwd,
//                     signUpInfo.profileType,
//                     signUpInfo.personal_account,
//                     signUpInfo.professional_account
//                 ]
//             );

//             const userId = createUser.rows[0].userid;

//             await pgClient.query(
//                 `INSERT INTO profiles (userid, profile_type)
//                 VALUES ($1, $2)`,
//                 [userId, signUpInfo.profileType.toLowerCase()]
//             );

//             return new Response(JSON.stringify({
//                 message: 'User successfully registered',
//                 userId: createUser.rows[0].userid,
//                 redirectUrl: "/profile"
//             }), { status: 201 });
//         } finally {
//             pgClient.release();
//         }
//     } catch (error) {
//         console.error('Database query error:', error);
        
//         // Better error handling
//         if (error.code === '23505') { // PostgreSQL unique violation code
//             if (error.constraint === 'users_email_key') {
//                 return new Response(JSON.stringify({ 
//                     error: 'Email already registered' 
//                 }), { status: 400 });
//             }
//             if (error.constraint === 'users_username_key') {
//                 return new Response(JSON.stringify({ 
//                     error: 'Username already taken' 
//                 }), { status: 400 });
//             }
//         }

//         return new Response(JSON.stringify({ 
//             error: 'Internal Server Error' 
//         }), { status: 500 });
//     }
// }