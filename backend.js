import express from "express";
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./DATABASE.db');

db.run('CREATE TABLE IF NOT EXISTS users(username text NOT NULL UNIQUE, id INTEGER PRIMARY KEY AUTOINCREMENT, password text NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS characters(name text UNIQUE, classlevel TEXT, background TEXT, race TEXT, alignment TEXT, experience INTEGER,'+
  ' strengthmod TEXT, strengthnumber INTEGER, dexmod TEXT, dexnumber INTEGER, username	TEXT, constitutionmod TEXT, constitutionnumber INTEGER, '+
  ' intelligencemod TEXT, intelligencenumber INTEGER,  wisdommod TEXT, wisdomnumber INTEGER , charismamod TEXT , charismanumber INTEGER , inspiration INTEGER, '+
  ' proficiencybonus TEXT , strstcheck BOOL, strengthsavingthrow TEXT, dexstcheck BOOL, dexteritysavingthrow TEXT, constcheck BOOL, constitutionsavingthrow TEXT, '+
  ' intstcheck BOOL, intelligencesavingthrow TEXT, wisstcheck BOOL,  wisdomsavingthrow TEXT, chastcheck BOOL, charismasavingthrow TEXT, acrobatics TEXT, acrobaticscheck BOOL, '+
  ' animalhandlingcheck BOOL, animalhandling BOOL, arcanacheck BOOL, arcana TEXT, athleticscheck BOOL ,athletics TEXT, deceptioncheck BOOL, deception TEXT, historycheck BOOL, '+
  ' history TEXT, insightcheck BOOL ,insight TEXT, intimidationcheck BOOL, intimidation TEXT, investigationcheck BOOL, investigation TEXT, medicinecheck BOOL, medicine TEXT, '+
  ' naturecheck BOOL,nature TEXT, perceptioncheck BOOL, perception TEXT, perfomancecheck BOOL, perfomance TEXT , persuasioncheck BOOL, persuasion TEXT , religioncheck BOOL, '+
  ' religion TEXT , sleightofhandscheck BOOL , sleightofhands TEXT , stealthcheck BOOL, stealth TEXT , survivalcheck BOOL,survival TEXT ,passivewisdom INTEGER , '+
  'proficienciestextarea TEXT ,armor INTEGER ,initiative TEXT ,speed INTEGER , currenthitpoints TEXT , temporaryhitpoints TEXT ,hitdice TEXT,weapon1 TEXT, atkbonus1 TEXT, '+
  'dmg1 TEXT,weapon2 TEXT,atkbonus2 TEXT,dmg2 TEXT ,weapon3 TEXT,atkbonus3 TEXT,dmg3 TEXT,cp INTEGER,sp INTEGER,ep INTEGER,gp INTEGER,pp INTEGER,equipmenttextarea TEXT, '+
  'personality TEXT,ideals TEXT,bonds TEXT,flaws TEXT, features TEXT, FOREIGN KEY(username) REFERENCES users (username))')

const port = process.env.Port || 3001;

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
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
      console.error('Database error on SELECT:', err); 
      res.status(500).send({ message: 'Database error' });
    } else if (row) {
      res.send({ message: 'Character already exists' });
    } else {
      db.run('INSERT INTO characters (name, username) VALUES (?, ?)', [buttonname, username], (err) => {
        if (err) {
          console.error('Database error on INSERT:', err);
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
  const { name, classlevel, background, race, alignment, experience, strengthmod, strengthnumber, dexteritymod, dexteritynumber, constitutionmod, constitutionnumber, intelligencemod, intelligencenumber, wisdommod, wisdomnumber, charismamod, charismanumber, inspiration, proficiencybonus, strengthsavingthrow, dexteritysavingthrow, constitutionsavingthrow, intelligencesavingthrow, wisdomsavingthrow, charismasavingthrow, acrobaticscheck, acrobatics, animalhandlingcheck, animalhandling, arcanacheck, arcana, athleticscheck, athletics, deceptioncheck, deception, historycheck, history, insightcheck, insight, intimidationcheck, intimidation, investigationcheck, investigation, medicinecheck, medicine, naturecheck, nature, perceptioncheck, perception, perfomancecheck, perfomance, persuasioncheck, persuasion, religioncheck, religion, sleightofhandscheck, sleightofhands, stealthcheck, stealth, survivalcheck, survival, passivewisdom, proficienciestextarea, armor, initiative, speed, currenthitpoints, temporaryhitpoints, hitdice,weapon1, atkbonus1, dmg1, weapon2, atkbonus2, dmg2, weapon3, atkbonus3, dmg3, cp, sp , ep, gp, pp, equipmenttextarea, ideals, bonds, flaws } = req.body;
  db.run('UPDATE characters SET classlevel = ?, background = ?, race = ?, alignment = ?, experience = ?, strengthmod = ?, strengthnumber = ?, dexmod = ?, dexnumber =?, constitutionmod = ?, constitutionnumber = ?, intelligencemod = ?, intelligencenumber = ?, wisdommod = ?, wisdomnumber = ?, charismamod = ?, charismanumber = ?, inspiration = ?, proficiencybonus = ?, strengthsavingthrow = ?, dexteritysavingthrow = ?, constitutionsavingthrow = ?, intelligencesavingthrow = ?, wisdomsavingthrow = ?, charismasavingthrow = ?, acrobaticscheck = ?, acrobatics = ?, animalhandlingcheck = ?, animalhandling = ?, arcanacheck = ?, arcana = ?, athleticscheck = ?, athletics = ?, deceptioncheck = ?, deception = ?, historycheck = ?, history = ?, insightcheck = ?, insight = ?, intimidationcheck = ?, intimidation = ?, investigationcheck = ?, investigation = ?, medicinecheck = ?, medicine = ?, naturecheck = ?, nature = ?, perceptioncheck = ?, perception = ?, perfomancecheck = ?, perfomance = ?, persuasioncheck = ?, persuasion = ?, religioncheck = ? , religion = ?,'+
    ' sleightofhandscheck = ?, sleightofhands = ?, stealthcheck = ?, stealth = ?, survivalcheck = ?, survival = ?, passivewisdom = ?, proficienciestextarea = ?, armor = ?, initiative = ?, speed = ?, currenthitpoints = ?, temporaryhitpoints = ?, hitdice = ?, weapon1 = ?, atkbonus1 = ?, dmg1 = ?, weapon2 = ?, atkbonus2 = ?, dmg2 = ?, weapon3 = ?, atkbonus3 = ?, dmg3 = ?, cp = ?, sp = ?, ep = ?, gp = ?, pp = ?, equipmenttextarea = ?, '+
    ' ideals = ?, bonds = ?, flaws = ?  WHERE name = ?', [classlevel, background, race, alignment, experience, strengthmod, strengthnumber, dexteritymod, dexteritynumber, constitutionmod, constitutionnumber, intelligencemod, intelligencenumber, wisdommod, wisdomnumber, charismamod, charismanumber, inspiration, proficiencybonus, strengthsavingthrow, dexteritysavingthrow, constitutionsavingthrow, intelligencesavingthrow, wisdomsavingthrow, charismasavingthrow, acrobaticscheck, acrobatics, animalhandlingcheck, animalhandling, arcanacheck, arcana, athleticscheck, athletics, deceptioncheck, deception, historycheck, history, insightcheck, insight, intimidationcheck, intimidation, investigationcheck, investigation, medicinecheck, medicine, naturecheck, nature, perceptioncheck, perception, perfomancecheck, perfomance, persuasioncheck, persuasion, religioncheck, religion, sleightofhandscheck, sleightofhands, stealthcheck, stealth, survivalcheck, survival, passivewisdom, proficienciestextarea, armor, initiative, speed, currenthitpoints, temporaryhitpoints, hitdice, weapon1, atkbonus1, dmg1, weapon2, atkbonus2, dmg2, weapon3, atkbonus3, dmg3, cp, sp, ep, gp, pp, equipmenttextarea, ideals, bonds, flaws, name], (err) => {
    if (err) {
      console.error('Database error on UPDATE:', err);
      res.status(500).send({ message: 'Database error' });
    } else {
      res.send({ message: 'Character data saved succesfully' });
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
    }
  });
});




app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});