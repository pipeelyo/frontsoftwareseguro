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

  // If the user is logged in, the SideNav is already visible from the layout.
  // We just show a welcome message in the main content area.
  if (user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido, {user.name}!</h1>
        <p className="mt-2 text-gray-600">Usa el menú de la izquierda para navegar.</p>
      </div>
    );
  }

  // If the user is not logged in, the SideNav is hidden.
  // We show the centered login form.
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <LoginClient initialUser={null} />
      </div>
    </div>
  );
}
