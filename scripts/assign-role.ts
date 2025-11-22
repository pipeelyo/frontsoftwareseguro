// scripts/assign-role.ts
import mongoose from 'mongoose';
import dbConnect from '../lib/db';
import User, { UserRole } from '../models/User';

const assignRole = async (email: string, role: UserRole) => {
  await dbConnect();

  const user = await User.findOne({ email });

  if (!user) {
    console.log(`Usuario con email ${email} no encontrado.`);
    return;
  }

  user.role = role;
  await user.save();

  console.log(`Rol de ${email} actualizado a ${role}.`);
};

const email = process.argv[2];
const role = process.argv[3] as UserRole;

if (!email || !role) {
  console.log('Uso: ts-node scripts/assign-role.ts <email> <rol>');
  console.log('Roles válidos: VIGILANTE, SUPERVISOR, ADMIN, CLIENTE, ADMINISTRATIVO');
  process.exit(1);
}

assignRole(email, role).then(() => {
  mongoose.disconnect();
});
