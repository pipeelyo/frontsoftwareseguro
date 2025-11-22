import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado.' }, { status: 400 });
  }

  try {
    await dbConnect();

    const verificationToken = await VerificationToken.findOne({
      token,
      type: 'EMAIL_VERIFICATION',
    });

    if (!verificationToken || new Date() > new Date(verificationToken.expires)) {
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 400 });
    }

    await User.updateOne(
      { _id: verificationToken.userId },
      { emailVerified: new Date() }
    );

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // You can redirect to a login page with a success message
    const url = new URL('/', req.url);
    url.searchParams.set('verified', 'true');
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
