// =====================================================================
// DATABASE CONNECTION - CAJUHUB
// =====================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cajuhub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
pool.getConnection()
  .then(connection => {
    console.log('✓ Conexão com banco de dados estabelecida com sucesso!');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Erro ao conectar ao banco de dados:', err.message);
    console.error('Certifique-se de que:');
    console.error('1. O arquivo .env está configurado corretamente');
    console.error('2. O servidor MySQL está rodando');
    console.error('3. As credenciais estão corretas');
  });

module.exports = pool;
