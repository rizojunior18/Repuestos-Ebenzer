const bcrypt = require('bcrypt');
const pool = require('./db');

async function arreglarContrasena() {
  // Cifra la contraseña '123456' de manera real
  const hashReal = await bcrypt.hash('123456', 10);
  
  // La actualiza en tu base de datos PostgreSQL
  await pool.query("UPDATE usuarios SET contrasena_hash = $1 WHERE correo = 'admin@ebenezer.com'", [hashReal]);
  
  console.log('¡Contraseña actualizada con éxito!');
  process.exit();
}

arreglarContrasena();