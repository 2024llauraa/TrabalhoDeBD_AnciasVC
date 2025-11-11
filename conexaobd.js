// 2. ARQUIVO: conexaobd.js
const { Client } = require('pg');

// Seus dados do banco (mude aqui)
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'bd_trabalho4',
  user: 'postgres',
  password: 'postgres123'
});

// Conectar no banco
client.connect()
  .then(() => console.log('Conectou no banco!'))
  .catch(err => console.log('Erro:', err));

// Executar o teste
module.exports = client;

