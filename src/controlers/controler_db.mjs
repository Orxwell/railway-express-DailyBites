import dbClient from '../db/conn_db.mjs'
// -----------------------------------------------------

// Crear un nuevo registro en la tabla
async function createRecord(table, data) {
  const { error } = await dbClient
    .from(table)
    .insert(data);

  if (error) {
    console.error(`\n  ~Error al crear el registro en la tabla ${table}:`, error.message);
    throw new Error(error.message);
  }
}

// Leer registros de la tabla (filtro opcional)
async function readRecords(table, filter={}, columns='*') {
  const { data: records, error } = await dbClient
    .from(table)
    .select(columns) // Seleccionar toda la tabla, por defecto
    .match(filter);  // Filtrar las respuestas, opcional
  
  if (error) {
    console.error(`\n  ~Error al leer registros de la tabla ${table}:`, error.message);
    throw new Error(error.message);
  }

  return records;
}

// Actualizar registros en la tabla con un filtro dinámico
async function updateRecord(table, filter={}, new_data) {
  const { error } = await dbClient
    .from(table)
    .update(new_data) // Actualizar los datos
    .match(filter);   // Filtrar qué datos se van a alterar

  if (error) {
    console.error(`\n  ~Error al actualizar el registro en la tabla ${table}:`, error.message);
    throw new Error(error.message);
  }
}

// Eliminar registros en la tabla con un filtro dinámico
async function deleteRecord(table, filter) {
  const { error } = await dbClient
    .from(table)
    .delete()
    .match(filter); // Usamos .match para aplicar el filtro dinámico

  if (error) {
    console.error(`\n  ~Error al eliminar registros de la tabla ${table}:`, error.message);
    throw new Error(error.message);
  }
}

// Eliminar todos los registros en la tabla
async function truncateTable(table) {
  const { error } = await dbClient.rpc('truncate_table', { table_name: table });

  if (error) {
    console.error(`\n  ~Error truncando la tabla ${table}:`, error.message);
    throw new Error(error.message);
  }
}
// -----------------------------------------------------

// Crear una tabla
async function createTable(table_name, columns) {
  const query = `
    CREATE TABLE IF NOT EXISTS public.${table_name} (
      ${columns.map(column => `${column.name} ${column.type}`).join(', ')}
    )
  `

  const { error } = await dbClient.rpc('execute_sql', { sql: query });
  if (error) {
    console.error(`\n  ~Error al crear la tabla ${table_name}:`, error.message);
    throw new Error(error.message);
  }
};

// Eliminar una tabla
async function deleteTable(table_name) {
  const query = `DROP TABLE IF EXISTS public.${table_name};`;

  const { error } = await dbClient.rpc('execute_sql', { sql: query });
  if (error) {
    console.error(`\n  ~Error al eliminar la tabla ${table_name}:`, error.message);
    throw new Error(error.message);
  }
}
// -----------------------------------------------------

const db = {
  createRecord,
  readRecords,
  deleteRecord,
  updateRecord,

  createTable,
  deleteTable,
  truncateTable
};
export default db;
