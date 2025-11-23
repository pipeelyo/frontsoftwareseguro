import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { getShiftsForUser, getActiveShiftForUser } from '@/lib/data/shifts';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userId = cookieStore.get('x-user-id')?.value;
  const userRole = cookieStore.get('x-user-role')?.value;

  if (!userId || !userRole) {
    redirect('/');
  }

  // Fetch initial data on the server
  const initialShifts = await getShiftsForUser(userId, userRole);
  const initialActiveShift = await getActiveShiftForUser(userId);

  return <DashboardClient token={token} initialShifts={initialShifts} initialActiveShift={initialActiveShift} />;
}

