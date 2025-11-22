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
      type: 'EMAIL_CHANGE',
    });

    if (!verificationToken || new Date() > new Date(verificationToken.expires) || !verificationToken.newEmail) {
      return NextResponse.json({ error: 'Token inválido, expirado o malformado.' }, { status: 400 });
    }

    // Check if the new email is already in use by another user
    const existingUser = await User.findOne({ email: verificationToken.newEmail! });
    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está en uso.' }, { status: 409 });
    }

    // Update the user's email
    await User.updateOne(
      { _id: verificationToken.userId },
      {
        email: verificationToken.newEmail,
        emailVerified: new Date(),
      }
    );

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // Redirect to a success page or login
    const url = new URL('/', req.url);
    url.searchParams.set('email_updated', 'true');
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('Email change verification error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
