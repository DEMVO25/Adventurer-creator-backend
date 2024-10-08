import express from "express";
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json()); // Add JSON body parsing middleware

const db = new sqlite3.Database('./DATABASE.db');

db.run('CREATE TABLE IF NOT EXISTS users(username text NOT NULL UNIQUE, id INTEGER PRIMARY KEY AUTOINCREMENT, password text NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS characters(name text NOT NULL UNIQUE, username	TEXT NOT NULL, FOREIGN KEY(username) REFERENCES users (username))')

const port = process.env.Port || 3001;

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username =?', [username], (err, row) => {
    if (err) {
      res.status(500).send({ message: 'Database error' });
    } else if (row) {
      res.send({ message: 'Username already exists' });
    } else {
      db.run('INSERT INTO users (username, password) VALUES (?,?)', [username, password], (err) => {
        if (err) {
          res.status(500).send({ message: 'Database error' });
        } else {
          res.send({ message: 'User created successfully' });
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username =? AND password =?', [username, password], (err, row) => {
    if (err) {
      res.status(500).send({ message: 'Database error' });
    } else if (row) {
      res.send({ authenticated: true });
    } else {
      res.send({ authenticated: false });
    }
  });
});

app.post('/menu', (req, res) => {
  const { buttonname } = req.body;
  db.get('SELECT * FROM characters WHERE name = ?', [buttonname], (err, row) => {
    if (err) {
      res.status(500).send({ message: 'Database error' });
    } else if (row) {
      res.send({ message: 'Character already exist' });
    } else {
      db.run('INSERT INTO characters (name) VALUES (?)', [buttonname], (err, row) => {
        if (err) {
          res.status(500).send({ message: 'Database error' });
        } else {
          res.send({ message: 'Character created successfully' });
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});