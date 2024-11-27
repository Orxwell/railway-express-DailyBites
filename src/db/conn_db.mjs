import { createClient } from '@supabase/supabase-js';
// -----------------------------------------------------

const dbURL = process.env.DB_URL;
const dbKEY = process.env.DB_KEY;

if (!dbURL) {
  console.error(
    '\n  ~Error:' +
    '\n    La variable de entorno DB_URI es obligatoria.'
  );
  process.exit(1);
}
  
if (!dbKEY) {
  console.error(
    '\n  ~Error:' +
    '\n    La variable de entorno DB_KEY es obligatoria.'
  );
  process.exit(1);
}

let dbClient;
try {
  dbClient = createClient(dbURL, dbKEY);
  console.log('  ~Succesfully connected to the Database.~')

} catch (err) {
  console.error(
    '\n  ~Error:' +
    '\n    No se pudo conectar con la base de datos:', err.message
  );
  process.exit(1);
}

export default dbClient;
