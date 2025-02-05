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
                username: { label: 'Username', type: 'text', placeholder: 'Username'},
                password: { label: 'Password', type: 'password'}
            },
            async authorize(credentials) {
                const dbClient = await postgresConnection.connect();
                try {
                    const dbQuery = await dbClient.query(
                        `SELECT userid, fname, lname, username, email, gender, dob, password 
                        FROM users 
                        WHERE username = $1`,
                        [credentials.username]
                    );
                    
                    if (dbQuery.rows.length === 0) {
                        throw new Error("User not found");
                    }
                    
                    const user = dbQuery.rows[0];
                    
                    if (credentials.password !== user.password) {
                        throw new Error("Invalid password");
                    }
                    
                    return {
                        id: user.userid,
                        username: user.username,
                        email: user.email,
                        fname: user.fName,
                        lname: user.lName,
                        gender: user.gender,
                        dob: user.dob,
                    }
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.userid;
                token.username = user.username;
                token.email = user.email;
                token.fname = user.fName;
                token.lname = user.lName;
                token.gender = user.gender;
                token.dob = user.dob;
                console.log("JWT callback - user data:", user);
            }
            console.log("JWT callback - final token:", token);
            return token;
        },
        async session({ session, token }) {
            console.log("Session callback - Token:", token);
            session.user = {
                id: token.sub,
                username: token.username,
                email: token.email,
                fName: token.fName,
                lName: token.lName,
                gender: token.gender,
                dob: token.dob,
            };
            console.log("Session callback - final session:", session);
            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };