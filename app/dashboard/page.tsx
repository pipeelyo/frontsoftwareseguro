import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  return <DashboardClient token={token} />;
}

