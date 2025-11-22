import { NextResponse } from 'next/server';
export async function POST() {
  const response = NextResponse.json({ message: 'Cierre de sesión exitoso.' });

  // Set the cookie with an immediate expiration date
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
