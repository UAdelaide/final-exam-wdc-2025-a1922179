const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'mysql',
    database: 'DogWalkService',
    socketPath: '/var/run/mysqld/mysqld.sock'
});

module.exports = db;
