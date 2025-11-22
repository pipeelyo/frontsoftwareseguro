import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Home, Shield, FileText, Users, BarChart, LogOut, UserCircle } from 'lucide-react';

interface JwtPayload {
  role: string;
  name: string;
}

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify<JwtPayload>(token, new TextEncoder().encode(secret));
      return payload;
    } catch (e) {
      return null;
    }
  }
  return null;
}

const navLinks = {
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Documentos', href: '/documents', icon: FileText },
    { name: 'Portal Cliente', href: '/client-portal', icon: Users },
    { name: 'Auditoría', href: '/audit', icon: BarChart },
  ],
  SUPERVISOR: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
  ],
  VIGILANTE: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
  ],
  CLIENTE: [
    { name: 'Portal Cliente', href: '/client-portal', icon: Users },
  ],
  ADMINISTRATIVO: [
    { name: 'Documentos', href: '/documents', icon: FileText },
  ],
};

export default async function SideNav() {
  const user = await getUser();

  if (!user) {
    return null; // Don't render the nav if not logged in
  }

  const links = navLinks[user.role as keyof typeof navLinks] || [];

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-gray-50 border-r">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <Shield size={48} />
          <p className="text-lg font-bold">Software Seguro</p>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <div className="flex flex-col w-full">
          <Link
            href="/profile"
            className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-black hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <UserCircle className="w-6" />
            <p className="hidden md:block">Perfil</p>
          </Link>
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-black hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                <LinkIcon className="w-6" />
                <p className="hidden md:block">{link.name}</p>
              </Link>
            );
          })}
        </div>
        <div className="hidden md:block font-medium p-2 text-black">{user.name}</div>
        <form action={async () => {
          'use server';
          (await cookies()).delete('auth_token');
          // Re-validate path to trigger re-render
          const { redirect } = await import('next/navigation');
          redirect('/');
        }}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-black hover:bg-gray-200 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <LogOut className="w-6" />
            <p className="hidden md:block">Cerrar Sesión</p>
          </button>
        </form>
      </div>
    </div>
  );
}
