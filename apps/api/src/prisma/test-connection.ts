import 'temporal-polyfill/full/global';
import 'dotenv/config';
import { db } from './db';

async function main() {
  const usuarios = await db.orm.public.Usuario.all();
  console.log('Usuarios encontrados:', usuarios.length);
  console.log(usuarios);
  await db.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
