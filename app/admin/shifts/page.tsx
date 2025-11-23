import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ShiftManagementClient from './ShiftManagementClient';
import { getShiftsForUser } from '@/lib/data/shifts';

export default async function AdminShiftsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('x-user-id')?.value;
  const userRole = cookieStore.get('x-user-role')?.value;

  if (!userId || !userRole) {
    redirect('/');
  }

  const shifts = await getShiftsForUser(userId, userRole);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestionar Turnos</h1>
      <ShiftManagementClient initialShifts={shifts} />
    </div>
  );
}
