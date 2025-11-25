// scripts/close-active-shifts.ts
import mongoose from 'mongoose';
import dbConnect from '../lib/db';
import Shift from '../models/Shift';
import User from '../models/User';

const closeActiveShifts = async (email?: string) => {
  await dbConnect();

  let query: any = { status: 'ACTIVE' };

  if (email) {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Usuario con email ${email} no encontrado.`);
      return;
    }
    query.userId = user._id;
    console.log(`Buscando turnos activos para: ${email}`);
  } else {
    console.log('Buscando todos los turnos activos...');
  }

  const activeShifts = await Shift.find(query).populate('userId', 'name email');

  if (activeShifts.length === 0) {
    console.log('No hay turnos activos.');
    return;
  }

  console.log(`\nEncontrados ${activeShifts.length} turno(s) activo(s):\n`);
  
  for (const shift of activeShifts) {
    const user = shift.userId as any;
    console.log(`- ID: ${shift._id}`);
    console.log(`  Usuario: ${user.name} (${user.email})`);
    console.log(`  Inicio: ${shift.startTime}`);
    console.log(`  Ubicación inicio: ${JSON.stringify(shift.startLocation)}`);
    
    // Cerrar el turno
    shift.endTime = new Date();
    shift.status = 'COMPLETED';
    await shift.save();
    
    console.log(`  ✓ Turno cerrado exitosamente\n`);
  }

  console.log(`Total de turnos cerrados: ${activeShifts.length}`);
};

const email = process.argv[2];

if (email && email === '--help') {
  console.log('Uso: npm run close-shifts [email]');
  console.log('');
  console.log('Sin argumentos: cierra TODOS los turnos activos');
  console.log('Con email: cierra solo los turnos del usuario especificado');
  console.log('');
  console.log('Ejemplos:');
  console.log('  npm run close-shifts');
  console.log('  npm run close-shifts -- vigilante@segurcontrol.com');
  process.exit(0);
}

closeActiveShifts(email).then(() => {
  mongoose.disconnect();
});
