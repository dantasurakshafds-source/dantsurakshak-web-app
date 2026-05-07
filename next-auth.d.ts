 
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phoneNumber?: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    phoneNumber?: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phoneNumber?: string;
    role: string;
  }
}
