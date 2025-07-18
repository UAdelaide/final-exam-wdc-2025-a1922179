var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dogRouter = require('./routes/dog_service');

var app = express();

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      socketPath: '/var/run/mysqld/mysqld.sock',
      host: '127.0.0.1',
      user: 'root',
      password: 'mysql' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'mysql',
      database: 'DogWalkService',
      socketPath: '/var/run/mysqld/mysqld.sock'
    });

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Dogs (
        dog_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES Users(user_id)
      )
    `);

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkRequests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        dog_id INT NOT NULL,
        requested_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
      )
    `);

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('owner', 'walker') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkApplications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        CONSTRAINT unique_application UNIQUE (request_id, walker_id)
      )
    `);

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkRatings (
        rating_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        owner_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comments TEXT,
        rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        FOREIGN KEY (owner_id) REFERENCES Users(user_id),
        CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
      )
    `);

    // Insert data if table is empty
    const [rows1] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows1[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES ('alice123', 'alice@example.com', 'hashed123', 'owner'), ('bobwalker', 'bob@example.com', 'hashed456', 'walker'), ('carol123', 'carol@example.com', 'hashed789', 'owner'), ('elcampeon', 'campeon@example.com', 'hashed987', 'walker'), ('christina', 'christina@example.cpm', 'hashed654', 'owner')
      `);
    }

    // Insert data if table is empty
    const [rows2] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (rows2[0].count === 0) {
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'), ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'), ((SELECT user_id FROM Users WHERE username = 'christina'), 'Protein', 'large'), ((SELECT user_id FROM Users WHERE username = 'christina'), 'Hotdog', 'small'), ((SELECT user_id FROM Users WHERE username = 'christina'), 'Princess', 'large')
      `);
    }

    // Insert data if table is empty
    const [rows3] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (rows3[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'), ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'), ((SELECT dog_id FROM Dogs WHERE name = 'Protein'), '2025-06-10 12:45:00', 60, 'Campbelltown Oval', 'open'), ((SELECT dog_id FROM Dogs WHERE name = 'Hotdog'), '2025-06-10 9:00:00', 125, 'Morialta Falls', 'cancelled'), ((SELECT dog_id FROM Dogs WHERE name = 'Princess'), '2025-06-10 11:00:00', 30, 'Rostrevor', 'accepted')
      `);
    }

    // Insert data if table is empty
    const [rows4] = await db.execute('SELECT COUNT(*) AS count FROM WalkRatings');
    if (rows4[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES ((SELECT request_id FROM WalkRequests WHERE request_id = 1), (SELECT user_id FROM Users WHERE user_id = 1), (SELECT user_id FROM Users WHERE user_id = 1), 1, 'some comment')
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', dogRouter);

module.exports = app;
