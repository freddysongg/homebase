import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoClient } from 'mongodb';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      createdAt?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile || !profile.email) return false;

      try {
        const client = new MongoClient(process.env.MONGODB_URI as string);
        await client.connect();
        const db = client.db();

        const existingUser = await db.collection('users').findOne({ email: profile.email });

        if (!existingUser) {
          await db.collection('users').insertOne({
            name: profile.name,
            email: profile.email,
            // image: profile.picture || profile.image,
            createdAt: new Date().toISOString()
          });
        }

        await client.close();
        return true;
      } catch (error) {
        console.error('Database Error:', error);
        return false;
      }
    },

    async session({ session }) {
      try {
        if (!session.user?.email) return session;

        const client = new MongoClient(process.env.MONGODB_URI as string);
        await client.connect();
        const db = client.db();

        const user = await db.collection('users').findOne({ email: session.user.email });

        await client.close();

        if (user) {
          session.user.id = user._id.toString();
          session.user.createdAt = user.createdAt ? user.createdAt.toISOString() : '';
        }

        return session;
      } catch (error) {
        console.error('Session Callback Error:', error);
        return session;
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login'
  }
};

export default NextAuth(authOptions);
