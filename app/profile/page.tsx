import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ProfileClient from './ProfileClient';

async function getUserProfile(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).lean();
  if (!user) {
    return null;
  }
  return { name: user.name, email: user.email };
}

export default async function ProfilePage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    redirect('/');
  }

  const profile = await getUserProfile(userId);

  if (!profile) {
    // This case should not happen if user is logged in, but as a safeguard
    redirect('/');
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <ProfileClient initialProfile={profile} />
    </div>
  );
}
