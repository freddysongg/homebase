import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';

async function connectToDatabase() {
  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db();
  return { client, db };
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {

        console.log('Credentials received:', credentials);

        if (!credentials || !credentials.email || !credentials.password) {
          console.error('Email and password are required');
          throw new Error('Email and password are required');
        }

        const { client, db } = await connectToDatabase();

        try {
          const user = await db.collection('users').findOne({ email: credentials.email });

          if (!user) {
            console.error('No user found with this email');
            throw new Error('No user found with this email');
          }

          console.log('User found:', user);

          if (credentials.password !== user.password) {
            console.error('Invalid password');
            throw new Error('Invalid password');
          }

          return { id: user._id.toString(), name: user.name, email: user.email };
        } catch (error) {
          console.error('Error during authorization:', error);
          throw new Error('Authentication failed');
        } finally {
          await client.close();
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
