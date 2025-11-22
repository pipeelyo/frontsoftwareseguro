import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logAuditEvent } from '@/lib/audit';

// Function to generate a random password
function generateRandomPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const genericResponse = NextResponse.json({ message: 'Si una cuenta con ese correo electrónico existe, se ha generado una nueva contraseña.' });

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return genericResponse;
    }

    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tokenVersion += 1; // Invalidate old sessions
    await user.save();

    // Log the new password to the server console for the admin to see
    console.log(`============================================================`);
    console.log(`PASSWORD RESET`);
    console.log(`User: ${user.email}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`============================================================`);

    logAuditEvent({
      userId: user._id,
      action: 'PASSWORD_RESET_REQUEST',
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return genericResponse;

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
