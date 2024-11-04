import express from "express";
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json()); 

const db = new sqlite3.Database('./DATABASE.db');

db.run('CREATE TABLE IF NOT EXISTS users(username text NOT NULL UNIQUE, id INTEGER PRIMARY KEY AUTOINCREMENT, password text NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS characters(name text NOT NULL UNIQUE, adventurername text UNIQUE, classlevel TEXT, background TEXT, race TEXT, alignment TEXT, experience INTEGER, strengthmod TEXT, strengthnumber INTEGER, dexmod TEXT, dexnumber INTEGER, username	TEXT, constitutionmod TEXT, constitutionnumber INTEGER,intelligencemod TEXT, intelligencenumber INTEGER, wisdommod TEXT, wisdomnumber INTEGER , charismamod TEXT , charismanumber INTEGER , inspiration INTEGER, proficiencybonus TEXT , strengthsavingthrow TEXT,dexteritysavingthrow TEXT,constitutionsavingthrow TEXT,intelligencesavingthrow TEXT,wisdomsavingthrow TEXT,charismasavingthrow TEXT,acrobaticscheck TEXT,animalhandling TEXT,arcana TEXT,athletics TEXT,deception TEXT,history TEXT,insight TEXT,intimidation TEXT,investigation TEXT,medicine TEXT,nature TEXT,perception TEXT,perfomance TEXT ,persuasion TEXT ,religion TEXT ,sleightofhands TEXT ,stealth TEXT ,survival TEXT ,passivewisdom INTEGER ,proficienciestextarea TEXT ,armor INTEGER ,initiative TEXT ,speed INTEGER ,currenthitpoints TEXT ,temporaryhitpoints TEXT ,hitdice TEXT,weapon1 TEXT,atkbonus1 TEXT,dmg1 TEXT,weapon2 TEXT,atkbonus2 TEXT,dmg2 TEXT ,weapon3 TEXT,atkbonus3 TEXT,dmg3 TEXT,cp INTEGER,sp INTEGER,ep INTEGER,gp INTEGER,pp INTEGER,equipmenttextarea TEXT,personality TEXT,ideals TEXT,bonds TEXT,flaws TEXT, FOREIGN KEY(username) REFERENCES users (username))')

const port = process.env.Port || 3001;

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password here
  db.get('SELECT * FROM users WHERE username =?', [username], (err, row) => {
    if (err) {
      res.status(500).send({ message: 'Database error' });
    } else if (row) {
      res.send({ message: 'Username already exists' });
    } else {
      db.run('INSERT INTO users (username, password) VALUES (?,?)', [username, hashedPassword], (err) => {
        if (err) {
          res.status(500).send({ message: 'Database error' });
        } else {
          res.send({ message: 'User  created successfully' });
        }
      });
    }
  });
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
          res.status(500).send({ message: 'Database error' });
      } else if (!row) {
          res.send({ authenticated: false });
      } else {
          // Compare the provided password with the stored hashed password
          const isMatch = bcrypt.compareSync(password, row.password);
          if (isMatch) {
              res.send({ authenticated: true });
          } else {
              res.send({ authenticated: false });
          }
      }
  });
});

app.post('/menu', (req, res) => {
  const { buttonname, username } = req.body;
  db.get('SELECT * FROM characters WHERE name = ?', [buttonname], (err, row) => {
    if (err) {
      console.error('Database error on SELECT:', err); // Log the error
      res.status(500).send({ message: 'Database error' });
    } else if (row) {
      res.send({ message: 'Character already exists' });
    } else {
      db.run('INSERT INTO characters (name, username) VALUES (?, ?)', [buttonname, username], (err) => {
        if (err) {
          console.error('Database error on INSERT:', err); // Log the error
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