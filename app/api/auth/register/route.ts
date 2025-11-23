import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { logAuditEvent } from '@/lib/audit';

// Password policy: minimum 8 characters, one uppercase, one lowercase, one number, one special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // 1. Server-side validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
      }, { status: 400 });
    }

    // 2. Check if user already exists
    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está en uso.' }, { status: 409 });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    logAuditEvent({ userId: user._id, action: 'USER_REGISTER', ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown' });

    // 5. Generate verification token
    const verificationTokenValue = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const verificationToken = new VerificationToken({
      token: verificationTokenValue,
      expires,
      type: 'EMAIL_VERIFICATION',
      userId: user._id,
    });
    await verificationToken.save();

    // Simulate sending email by logging to console
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/api/auth/verify?token=${verificationTokenValue}`;
    console.log(`Verification link for ${email}: ${verificationLink}`);

    return NextResponse.json({ message: 'Usuario registrado con éxito.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
