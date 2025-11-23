import dbConnect from '../lib/db';
import User from '../models/User';

const email = process.argv[2];

if (!email) {
  console.error('Por favor proporciona un email: npm run verify-user -- usuario@ejemplo.com');
  process.exit(1);
}

async function verifyUser() {
  await dbConnect();
  
  const user = await User.findOne({ email });
  
  if (!user) {
    console.error(`Usuario con email ${email} no encontrado.`);
    process.exit(1);
  }
  
  if (user.isVerified) {
    console.log(`El usuario ${email} ya está verificado.`);
    process.exit(0);
  }
  
  user.isVerified = true;
  await user.save();
  
  console.log(`✅ Usuario ${email} verificado exitosamente.`);
  process.exit(0);
}

verifyUser().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
