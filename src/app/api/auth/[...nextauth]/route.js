import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import postgresConnection from "@/lib/db";
import { compare } from 'bcryptjs';

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
                        `SELECT userid, fname, lname, username, email, gender, dob, password, 
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
                        fname: user.fname,
                        lname: user.lname,
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
                token.fname = user.fname;
                token.lname = user.lname;
                token.gender = user.gender;
                token.dob = user.dob;
                token.personal_account = user.personal_account;
                token.professional_account = user.professional_account;
                token.profileType = user.profileType; // Make sure to include this
            }

            if (trigger === "update" && session?.profileType) {
                token.profileType = session.profileType;
            }

            // When refreshing from database
            if (token.id || token.userId) {
                const userId = token.id || token.userId;
                const dbClient = await postgresConnection.connect();
                try {
                    const result = await dbClient.query(
                        `SELECT userid, fname, lname, username, email, gender, dob, profile_type 
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
                            dob: freshUser.dob,
                            profileType: freshUser.profile_type // Make sure this is included
                        };
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
                fname: token.fname,
                lname: token.lname,
                gender: token.gender,
                dob: token.dob,
                profileType: token.profileType, // Make sure this is included
                personal_account: token.personal_account,
                professional_account: token.professional_account,
            };

            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };