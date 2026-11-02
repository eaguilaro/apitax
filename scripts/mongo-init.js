// MongoDB ejecuta este archivo al crear por primera vez el volumen de la base.
const dbName = process.env.MONGO_INITDB_DATABASE || 'apitax';
const apitax = db.getSiblingDB(dbName);

for (const collection of ['gastos', 'ingresos']) {
  if (!apitax.getCollectionNames().includes(collection)) {
    apitax.createCollection(collection);
  }
}
