import express from "express";
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./DATABASE.db');

db.run('CREATE TABLE IF NOT EXISTS users(username text NOT NULL UNIQUE, id INTEGER PRIMARY KEY AUTOINCREMENT, password text NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS characters(name text UNIQUE, classlevel TEXT, background TEXT, race TEXT, alignment TEXT, experience INTEGER, strengthcheck TEXT, strengthmod TEXT, strengthnumber INTEGER, dexcheck TEXT, dexmod TEXT, dexnumber INTEGER, username	TEXT, concheck TEXT, constitutionmod TEXT, constitutionnumber INTEGER, intcheck TEXT, intelligencemod TEXT, intelligencenumber INTEGER, wischeck TEXT, wisdommod TEXT, wisdomnumber INTEGER , chacheck TEXT, charismamod TEXT , charismanumber INTEGER , inspiration INTEGER, proficiencybonus TEXT , strcheck TEXT, strengthsavingthrow TEXT, dexstcheck TEXT, dexteritysavingthrow TEXT, constcheck TEXT, constitutionsavingthrow TEXT, intstcheck TEXT, intelligencesavingthrow TEXT, wisstcheck TEXT,  wisdomsavingthrow TEXT, chastcheck TEXT, charismasavingthrow TEXT, acrobatics TEXT, acrobaticscheck TEXT, animalhandlingcheck TEXT, animalhandling TEXT, arcanacheck TEXT, arcana TEXT, athleticscheck TEXT ,athletics TEXT, deceptioncheck TEXT, deception TEXT, historycheck TEXT,  history TEXT, insightcheck TEXT ,insight TEXT, intimidationcheck TEXT, intimidation TEXT, investigationcheck TEXT, investigation TEXT, medicinecheck TEXT, medicine TEXT, naturecheck TEXT,nature TEXT, perceptioncheck TEXT, perception TEXT, perfomancecheck TEXT, perfomance TEXT , persuasioncheck TEXT,persuasion TEXT , religioncheck TEXT,religion TEXT , sleightofhandscheck TEXT , sleightofhands TEXT , stealthcheck TEXT, stealth TEXT , survivalcheck TEXT,survival TEXT ,passivewisdom INTEGER ,proficienciestextarea TEXT ,armor INTEGER ,initiative TEXT ,speed INTEGER ,currenthitpoints TEXT ,temporaryhitpoints TEXT ,hitdice TEXT,weapon1 TEXT,atkbonus1 TEXT,dmg1 TEXT,weapon2 TEXT,atkbonus2 TEXT,dmg2 TEXT ,weapon3 TEXT,atkbonus3 TEXT,dmg3 TEXT,cp INTEGER,sp INTEGER,ep INTEGER,gp INTEGER,pp INTEGER,equipmenttextarea TEXT,personality TEXT,ideals TEXT,bonds TEXT,flaws TEXT, FOREIGN KEY(username) REFERENCES users (username))')

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

app.get('/menu/:username', (req, res) => {
  const username = req.params.username
  db.all('SELECT name FROM characters WHERE username = ?', [username], (err, rows) => {
    if (err) {
      console.error('Database error on SELECT:', err);
      res.status(500).send({ message: 'Database error' });
    } else {
      res.send(rows);
    }
  });
});

app.post('/sheet', (req, res) => {
  const { name, classlevel, background, race, alignment, experience, strengthmod, strengthnumber, dexteritymod, dexteritynumber, constitutionmod, constitutionnumber, intelligencemod, intelligencenumber, wisdommod, wisdomnumber, charismamod, charismanumber, inspiration, proficiencybonus, strengthsavingthrow, dexteritysavingthrow, constitutionsavingthrow, intelligencesavingthrow, wisdomsavingthrow, charismasavingthrow, acrobaticscheck, acrobatics, animalhandlingcheck, animalhandling, arcanacheck, arcana, athleticscheck, athletics, deceptioncheck, deception, historycheck, history, insightcheck, insight, intimidationcheck, intimidation, investigationcheck, investigation, medicinecheck, medicine, naturecheck, nature, perceptioncheck, perception, perfomancecheck, perfomance } = req.body;
  db.run('UPDATE characters SET classlevel = ?, background = ?, race = ?, alignment = ?, experience = ?, strengthmod = ?, strengthnumber = ?, dexmod = ?, dexnumber =?, constitutionmod = ?, constitutionnumber = ?, intelligencemod = ?, intelligencenumber = ?, wisdommod = ?, wisdomnumber = ?, charismamod = ?, charismanumber = ?, inspiration = ?, proficiencybonus = ?, strengthsavingthrow = ?, dexteritysavingthrow = ?, constitutionsavingthrow = ?, intelligencesavingthrow = ?, wisdomsavingthrow = ?, charismasavingthrow = ?, acrobaticscheck = ?, acrobatics = ?, animalhandlingcheck = ?, animalhandling = ?, arcanacheck = ?, arcana = ?, athleticscheck = ?, athletics = ?, deceptioncheck = ?, deception = ?, historycheck = ?, history = ?, insightcheck = ?, insight = ?, intimidationcheck = ?, intimidation = ?, investigationcheck = ?, investigation = ?, medicinecheck = ?, medicine = ?, naturecheck = ?, nature = ?, perceptioncheck = ?, perception = ?, perfomancecheck = ?, perfomance = ?  WHERE name = ?', [classlevel, background, race, alignment, experience, strengthmod, strengthnumber, dexteritymod, dexteritynumber, constitutionmod, constitutionnumber, intelligencemod, intelligencenumber, wisdommod, wisdomnumber, charismamod, charismanumber, inspiration, proficiencybonus, strengthsavingthrow, dexteritysavingthrow, constitutionsavingthrow, intelligencesavingthrow, wisdomsavingthrow, charismasavingthrow, acrobaticscheck, acrobatics, animalhandlingcheck, animalhandling, arcanacheck, arcana, athleticscheck, athletics, deceptioncheck, deception, historycheck, history, insightcheck, insight, intimidationcheck, intimidation, investigationcheck, investigation, medicinecheck, medicine, naturecheck, nature, perceptioncheck, perception, perfomancecheck, perfomance, name], (err) => {
    if (err) {
      console.error('Database error on INSERT:', err);
      res.status(500).send({ message: 'Database error' });
    } else {
      res.send({ message: 'Charactes data saved succesfully' });
    }
  });
}
);

app.get('/sheet/:name', (req, res) => {
  const name = req.params.name
  db.get('SELECT * FROM characters WHERE name = ?', [name], (err, rows) => {
    if (err) {
      console.error('Database error on SELECT:', err);
      res.status(500).send({ message: 'Database error' });
    } else {
      res.send(rows);
      console.log;
    }
  });
});




app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});