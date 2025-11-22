import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';

export async function PUT(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { name, email } = await req.json();

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // Update name
    user.name = name;
    await user.save();

    // Handle email change
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'El nuevo correo electrónico ya está en uso.' }, { status: 409 });
      }

      // Generate a new verification token for the new email
      const verificationTokenValue = uuidv4();
      const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

      const token = new VerificationToken({
        token: verificationTokenValue,
        expires,
        type: 'EMAIL_CHANGE',
        userId: user._id,
        newEmail: email,
      });
      await token.save();

      // Simulate sending email
      const verificationLink = `http://localhost:3000/api/auth/verify-new-email?token=${verificationTokenValue}`;
      console.log(`Verification link for new email ${email}: ${verificationLink}`);

      return NextResponse.json({ message: 'Perfil actualizado. Se ha enviado un correo de verificación a la nueva dirección.' });
    }

    return NextResponse.json({ message: 'Perfil actualizado con éxito.' });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
