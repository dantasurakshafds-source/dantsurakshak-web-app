import type { NextAuthOptions, User } from "next-auth";
 
import CredentialsProvider from "next-auth/providers/credentials";
import { validateCredentials } from "@/utils/validateCredentials";
import UserModel from "@/models/User";
import { dbConnect } from "@/database/database";
import bcrypt from 'bcryptjs';

interface CustomUser extends User {
  id: string;
  name?: string;
  role: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
  isVerified?: boolean;
}

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/super-admin/login",
  },
  debug: process.env.NODE_ENV === "development",

  providers: [
    CredentialsProvider({
      id: "superadmin",
      name: "Super Admin Login",
      credentials: {
        email: { label: "E‑mail", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        try {
          console.log('Superadmin authorize called for email:', creds?.email);
          
          if (!creds?.email || !creds.password) {
            console.log('Missing credentials');
            throw new Error('Email and password are required');
          }

 
          await dbConnect();
          
          const email = creds.email.toLowerCase().trim();
          
          console.log('Looking for superadmin with email:', email);
          
      
          const user = await UserModel.findOne({ 
            email: email,
            role: "super-admin"  
          }).select('+password').lean();
          
          if (!user) {
            console.log('Superadmin user not found or wrong role');
            throw new Error('Invalid credentials');
          }
          
          console.log('User found, checking password...');
          
        
          const isValidPassword = await bcrypt.compare(
            creds.password, 
            user.password
          );
          
          if (!isValidPassword) {
            console.log('Invalid password');
            throw new Error('Invalid credentials');
          }

          console.log('Superadmin login successful for:', user.email);
          
          return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber || "",
            status: user.status || "approved",
            isVerified: user.isVerified || true
          } as CustomUser;
          
        } catch (err) {
          if(err instanceof Error){
            console.error('Superadmin authorize error');
          }
          throw new Error('Authentication failed');
        }
      }
    }),

   
    CredentialsProvider({
      id: "credentials",
      name: "Phone Login",
      credentials: {
        phoneNumber: { label: "Phone number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        if (!creds?.phoneNumber || !creds.password) return null;
        
     
        const user = await validateCredentials(creds.phoneNumber, creds.password);
        if (!user) return null;

        return {
          id: String(user._id),
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
          email: user.email,
          status: user.status,
          isVerified: user.isVerified
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as CustomUser).role;
        token.phoneNumber = (user as CustomUser).phoneNumber;
        token.status = (user as CustomUser).status;
        token.isVerified = (user as CustomUser).isVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.phoneNumber = token.phoneNumber as string;
        //@ts-expect-error ignore this error
        session.user.status = token.status as string;
          //@ts-expect-error ignore this error
        session.user.isVerified = token.isVerified as boolean;
      }
      
      return session;
    }
  }
};