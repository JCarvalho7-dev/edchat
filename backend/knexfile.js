module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://edchat:edchatpass@localhost:5432/edchatdb',
  pool: { min: 0, max: 7 }
};
