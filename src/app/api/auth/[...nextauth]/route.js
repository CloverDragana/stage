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
                   console.log("DB User:", user);
                   
                   if (credentials.password !== user.password) {
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
       async jwt({ token, user }) {
           if (user) {
               console.log("JWT callback - user:", user);
               token.id = user.userid;
               token.username = user.username;
               token.email = user.email;
               token.fname = user.fname;
               token.lname = user.lname;
               token.gender = user.gender;
               token.dob = user.dob;
           }
           console.log("JWT callback - token:", token);
           return token;
       },
       async session({ session, token }) {
           console.log("Session callback - token:", token);
           session.user = {
               id: token.sub,
               username: token.username,
               email: token.email,
               fname: token.fname,
               lname: token.lname,
               gender: token.gender,
               dob: token.dob,
           };
           return session;
       }
   }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };