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
            name : "Credentials",
            credentials: {
                username: { label :'Username', type: 'text', placeholder:'Username'},
                password: { label :'Password', type: 'password'}
            },

            async authorize(credentials){
                const dbClient = await postgresConnection.connect();
                try {
                    const dbQuery = await dbClient.query(
                        `SELECT * FROM users WHERE username = $1`,
                        [credentials.username]
                    );

                    if (dbQuery.rows.length === 0){
                        throw new Error("User not found");
                    }

                    const user = dbQuery.rows[0];
                    // const passwordCorrect = await compare(credentials.password, user.password);

                    if(password !== user.password){
                        throw new Error("Invalid password");
                    }
                    return {
                        id : user.userid, //.userId
                        username : user.username,
                        // creativeSlogan: user.creativeslogan || null,
                    }
                } finally{
                    dbClient.release();
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token}) {
            console.log("Session callback - Token:", token);
            session.user = {
                id: token.sub,
                username: token.username,
                //creativeSlogan: token.creativeSlogan || null,
            };
            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};