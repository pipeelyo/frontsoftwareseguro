import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('x-user-id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(userId).select('name email emailVerified');

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
