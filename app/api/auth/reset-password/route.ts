import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    // 1. Find all potential tokens for the user (this part is tricky without user context)
    // We must find the user associated with the token first.
    // Since the token is not stored in plain text, we can't look it up directly.
    // This requires a different strategy.

    // Let's find all non-expired password reset tokens.
    await dbConnect();

    const potentialTokens = await VerificationToken.find({
      type: 'PASSWORD_RESET',
      expires: { $gt: new Date() },
    }).populate('userId');

    let validToken = null;
    for (const t of potentialTokens) {
      const isMatch = await bcrypt.compare(token, t.token);
      if (isMatch) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 400 });
    }

    // 2. Validate new password policy
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ error: 'La nueva contraseña no cumple con los requisitos de seguridad.' }, { status: 400 });
    }

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password and invalidate all sessions
    await User.updateOne(
      { _id: validToken.userId },
      {
        $set: { password: hashedNewPassword },
        $inc: { tokenVersion: 1 },
      }
    );

    // 5. Invalidate all password reset tokens for this user
    await VerificationToken.deleteMany({
      userId: validToken.userId,
      type: 'PASSWORD_RESET',
    });

    // 6. Simulate email notification
    // The populated user object is now on validToken.userId
    const user = validToken.userId as any;
    console.log(`Password has been reset for ${user.email}`);

    return NextResponse.json({ message: 'Contraseña restablecida con éxito. Serás redirigido para iniciar sesión.' });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
