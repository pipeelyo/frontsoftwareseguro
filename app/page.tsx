import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import LoginClient from './LoginClient';

interface JwtPayload {
  name: string;
  role: string;
}

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify<JwtPayload>(
        token,
        new TextEncoder().encode(secret)
      );
      return { name: payload.name, role: payload.role };
    } catch (error) {
      return null;
    }
  }
  return null;
}

export default async function Home() {
  const user = await getUserFromToken();

  return (
    <LoginClient initialUser={user} />
  );
}
