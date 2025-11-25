// scripts/change-password.ts
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dbConnect from '../lib/db';
import User from '../models/User';

const changePassword = async (email: string, newPassword: string) => {
  await dbConnect();

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`Usuario con email ${email} no encontrado.`);
    return;
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  
  // Reset failed login attempts and lockout
  user.failedLoginAttempts = 0;
  user.lockoutUntil = undefined;
  
  await user.save();

  console.log(`Contraseña de ${email} actualizada correctamente.`);
};

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Uso: npm run change-password -- <email> <nueva-contraseña>');
  console.log('Ejemplo: npm run change-password -- admin@segurcontrol.com Pruebas123!');
  process.exit(1);
}

changePassword(email, newPassword).then(() => {
  mongoose.disconnect();
});
