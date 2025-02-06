import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import postgresConnection from "@/lib/db";
import { compare } from 'bcryptjs';

export const authOptions = {
    session: {
        strategy: 'jwt',
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
                        `SELECT userid, fname, lname, username, email, gender, dob, password 
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
                    
                    const returnUser = {
                        userid: user.userid,
                        username: user.username,
                        email: user.email,
                        fname: user.fname,
                        lname: user.lname,
                        gender: user.gender,
                        dob: user.dob,
                    };
                    
                    console.log("Returning:", returnUser);
                    return returnUser;
                    
                } finally {
                    dbClient.release();
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user, trigger }) {
            console.log("JWT Callback - Trigger:", trigger);
            console.log("JWT Callback - Incoming token:", token);
            console.log("JWT Callback - Incoming user:", user);

            // Always maintain the ID from initial sign in
            if (user) {
                token.id = user.userid;
                token.userId = user.userid; // Add redundant ID field just in case
            }

            // Only fetch fresh data if we have an ID
            if (token.id || token.userId) {
                const userId = token.id || token.userId;
                const dbClient = await postgresConnection.connect();
                try {
                    console.log("JWT Callback - Fetching fresh data for user:", userId);
                    const result = await dbClient.query(
                        `SELECT userid, fname, lname, username, email, gender, dob 
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
                            fname: freshUser.fname,
                            lname: freshUser.lname,
                            gender: freshUser.gender,
                            dob: freshUser.dob
                        };
                    }
                } finally {
                    dbClient.release();
                }
            }
            
            console.log("JWT Callback - Final token:", token);
            return token;
        },
        async session({ session, token }) {
            console.log("Session Callback - Incoming token:", token);
            
            if (!session.user) session.user = {};
            
            // Ensure we're copying all relevant fields
            session.user = {
                ...session.user,
                id: token.id || token.userId || token.sub,
                userId: token.id || token.userId || token.sub, // Add redundant ID field
                username: token.username,
                email: token.email,
                fname: token.fname,
                lname: token.lname,
                gender: token.gender,
                dob: token.dob,
            };

            console.log("Session Callback - Final session:", session);
            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };