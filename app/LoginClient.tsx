'use client';

import { useState, FormEvent } from 'react';

interface LoggedInUser {
  name: string;
  role: string;
}

interface LoginClientProps {
  initialUser: LoggedInUser | null;
}

export default function LoginClient({ initialUser }: LoginClientProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(initialUser);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggedInUser(null);
    window.location.href = '/'; // Force a full page reload
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      window.location.href = '/';
    } else {
      setError(data.error || 'Error al iniciar sesión.');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</label>
          <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
          <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Iniciar Sesión</button>
        </div>
      </form>
      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      <p className="text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Regístrate</a>
      </p>
    </>
  );
}
