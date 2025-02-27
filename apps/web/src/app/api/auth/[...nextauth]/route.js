import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import postgresConnection from "@/lib/db";
import { compare } from 'bcryptjs';
const jwt = require('jsonwebtoken');

export const authOptions = {
    session: {
        strategy: 'jwt',
        jwt: true,
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {},
                password: {}
            },
            async authorize(credentials) {
                const dbClient = await postgresConnection.connect();
                try {
                    const dbQuery = await dbClient.query(
                        `SELECT userid, fullname, username, email, gender, dob, password, 
                         personal_account, professional_account, profile_type 
                        FROM users 
                        WHERE username = $1`,
                        [credentials?.username]
                    );

                    console.log("Database query result:", dbQuery.rows);
                    
                    if (dbQuery.rows.length === 0) {
                        console.error("User not found:", credentials?.username);
                        throw new Error("User not found");
                    }
                    
                    const user = dbQuery.rows[0];
                    const correctPassword = await compare(credentials?.password || "", user.password);
                    
                    if (!correctPassword) {
                        throw new Error("Invalid password");
                    }

                    // Use the profile_type from database instead of deriving it
                    const returnUser = {
                        userid: user.userid,
                        username: user.username,
                        email: user.email,
                        fullname: user.fullname,
                        gender: user.gender,
                        dob: user.dob,
                        personal_account: user.personal_account,
                        professional_account: user.professional_account,
                        profileType: user.profile_type // Use the stored profile_type
                    };

                    return returnUser;
                } finally {
                    dbClient.release();
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.userid;
                token.userId = user.userid;
                token.username = user.username;
                token.email = user.email;
                token.fullname = user.fullname;
                token.gender = user.gender;
                token.dob = user.dob;
                token.personal_account = user.personal_account;
                token.professional_account = user.professional_account;
                token.profileType = user.profileType;

                token.accessToken = jwt.sign(
                    { 
                        id: user.userid,
                        userId: user.userid,
                        email: user.email,
                        username: user.username
                    }, 
                    process.env.NEXTAUTH_SECRET, 
                    { expiresIn: '1d' }
                );
            }

            if (trigger === "update") {
                // Update profile type if provided
                if (session?.profileType) {
                    token.profileType = session.profileType;
                }
                // Update account flags if provided
                if (session?.personal_account !== undefined) {
                    token.personal_account = session.personal_account;
                }
                if (session?.professional_account !== undefined) {
                    token.professional_account = session.professional_account;
                }

                if (token.id || token.userId) {
                    token.accessToken = jwt.sign(
                        { 
                            id: token.id || token.userId,
                            userId: token.id || token.userId,
                            email: token.email,
                            username: token.username
                        }, 
                        process.env.NEXTAUTH_SECRET, 
                        { expiresIn: '1d' }
                    );
                }
            }

            if (token.id || token.userId) {
                const userId = token.id || token.userId;
                const dbClient = await postgresConnection.connect();
                try {
                    const result = await dbClient.query(
                        `SELECT userid, fullname, username, email, gender, dob, profile_type, personal_account, professional_account 
                        FROM users WHERE userid = $1`,
                        [userId]
                    );
                    
                    if (result.rows[0]) {
                        const freshUser = result.rows[0];
                        token = {
                            ...token,
                            id: freshUser.userid,
                            userId: freshUser.userid,
                            username: freshUser.username,
                            email: freshUser.email,
                            fullname: freshUser.fullname,
                            gender: freshUser.gender,
                            dob: freshUser.dob,
                            profileType: freshUser.profile_type, // Make sure this is included
                            personal_account: freshUser.personal_account,
                            professional_account: freshUser.professional_account
                        };

                        token.accessToken = jwt.sign(
                            { 
                                id: freshUser.userid,
                                userId: freshUser.userid,
                                email: freshUser.email,
                                username: freshUser.username,
                                profileType: freshUser.profile_type
                            }, 
                            process.env.NEXTAUTH_SECRET, 
                            { expiresIn: '1d' }
                        );
                    }
                } finally {
                    dbClient.release();
                }
            }
            return token;
        },
        
        async session({ session, token }) {
            if (!session.user) session.user = {};
            
            session.user = {
                ...session.user,
                id: token.id || token.userId || token.sub,
                userId: token.id || token.userId || token.sub,
                username: token.username,
                email: token.email,
                fullname: token.fullname,
                gender: token.gender,
                dob: token.dob,
                profileType: token.profileType, // Make sure this is included
                personal_account: token.personal_account,
                professional_account: token.professional_account,
            };

            session.accessToken = token.accessToken;

            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };