import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logAuditEvent } from '@/lib/audit';

// IMPORTANT: Store this in an environment variable (.env) in a real application
const JWT_SECRET = process.env.JWT_SECRET;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 });
    }

    // 1. Find user by email
    await dbConnect();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logAuditEvent({ action: 'LOGIN_FAILURE', details: { email, reason: 'User not found' }, ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown' });
      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    // 2. Check if account is locked
    if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
      const timeLeft = Math.ceil((new Date(user.lockoutUntil).getTime() - new Date().getTime()) / (1000 * 60));
      logAuditEvent({ userId: user._id, action: 'LOGIN_FAILURE', details: { email, reason: 'Account locked' }, ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown' });
      return NextResponse.json({ error: `Cuenta bloqueada. Inténtalo de nuevo en ${timeLeft} minutos.` }, { status: 403 });
    }

    // 3. Compare password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock the account
        const lockoutUntil = new Date(new Date().getTime() + LOCKOUT_TIME_MINUTES * 60 * 1000);
        user.lockoutUntil = lockoutUntil;
        user.failedLoginAttempts = 0; // Reset attempts after locking
      }

      await user.save();

      logAuditEvent({ userId: user._id, action: 'LOGIN_FAILURE', details: { email, reason: 'Invalid password' }, ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown' });

      if (user.lockoutUntil) {
        logAuditEvent({ userId: user._id, action: 'ACCOUNT_LOCKED', details: { email }, ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown' });
      }

      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    // 4. Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;
      await user.save();
    }

    logAuditEvent({ userId: user._id, action: 'LOGIN_SUCCESS', ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown' });

    // 5. Generate JWT
    console.log(`[Login API] Generating token for user: ${user._id}`);
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, tokenVersion: user.tokenVersion, role: user.role },
      JWT_SECRET,
      { expiresIn: '60m' } // Token expires in 60 minutes
    );

    // 6. Set JWT in an HttpOnly, Secure cookie
    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      user: { name: user.name, email: user.email, role: user.role },
    });
    console.log('[Login API] Setting auth_token cookie.');
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
