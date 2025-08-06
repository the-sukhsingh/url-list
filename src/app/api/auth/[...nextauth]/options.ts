declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            id?: string;
        };
    }
}

import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                identifier:{
                    label: "Identifier",
                    type: "text",
                },
                password:{
                    label: "Password",
                    type: "password",
                    placeholder: "Password"
                }
            },
            async authorize(credentials: any):Promise<any>{
                if (!credentials) return null;
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })
                    if(!user){
                        throw new Error('No user found')
                    }

                    const isPasswordCorrect = await user.comparePassword(credentials.password);

                    if(!isPasswordCorrect){
                        throw new Error('Password incorrect')
                    }

                    return user

                } catch (error: Error | unknown) {
                    throw new Error(error instanceof Error ? error.message : 'An error occurred')
                }
            }
        })
    ],
    callbacks:{
        async session({ session, token }) {
            // Ensure session.user exists
            session.user = session.user || {};
            if (token) {
                session.user.email = token.email as string;
                session.user.id = (token._id as string) || (token.id as string);
            }
            return session;
        },
        async jwt({ token, user }) {
            if(user){ 
                token.email = user.email;
                token._id = (user as any)._id?.toString?.() || (user as any).id?.toString?.();
            }
            return token;
        }
},
    pages:{
        signIn: "/sign-in"
    },
    session:{
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET
}