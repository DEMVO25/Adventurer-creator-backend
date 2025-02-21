import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database("./DATABASE.db");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "justfortest383@gmail.com",
    pass: "owib ifdv ptqk bgvk",
  },
});

db.run(
  "CREATE TABLE IF NOT EXISTS users(email text NOT NULL, username text NOT NULL UNIQUE, id INTEGER PRIMARY KEY AUTOINCREMENT, password text NOT NULL, resetToken TEXT, resetTokenExpires INTEGER)"
);
db.run(
  "CREATE TABLE IF NOT EXISTS characters(name text UNIQUE, classlevel TEXT, background TEXT, race TEXT, alignment TEXT, experience INTEGER," +
    " strengthmod TEXT, strengthnumber INTEGER, dexmod TEXT, dexnumber INTEGER, username	TEXT, constitutionmod TEXT, constitutionnumber INTEGER, " +
    " intelligencemod TEXT, intelligencenumber INTEGER,  wisdommod TEXT, wisdomnumber INTEGER , charismamod TEXT , charismanumber INTEGER , inspiration INTEGER, " +
    " proficiencybonus TEXT , strstcheck BOOL, strengthsavingthrow TEXT, dexstcheck BOOL, dexteritysavingthrow TEXT, constcheck BOOL, constitutionsavingthrow TEXT, " +
    " intstcheck BOOL, intelligencesavingthrow TEXT, wisstcheck BOOL,  wisdomsavingthrow TEXT, chastcheck BOOL, charismasavingthrow TEXT, acrobatics TEXT, acrobaticscheck BOOL, " +
    " animalhandlingcheck BOOL, animalhandling BOOL, arcanacheck BOOL, arcana TEXT, athleticscheck BOOL ,athletics TEXT, deceptioncheck BOOL, deception TEXT, historycheck BOOL, " +
    " history TEXT, insightcheck BOOL ,insight TEXT, intimidationcheck BOOL, intimidation TEXT, investigationcheck BOOL, investigation TEXT, medicinecheck BOOL, medicine TEXT, " +
    " naturecheck BOOL,nature TEXT, perceptioncheck BOOL, perception TEXT, perfomancecheck BOOL, perfomance TEXT , persuasioncheck BOOL, persuasion TEXT , religioncheck BOOL, " +
    " religion TEXT , sleightofhandscheck BOOL , sleightofhands TEXT , stealthcheck BOOL, stealth TEXT , survivalcheck BOOL,survival TEXT ,passivewisdom INTEGER , " +
    "proficienciestextarea TEXT ,armor INTEGER ,initiative TEXT ,speed INTEGER , currenthitpoints TEXT , temporaryhitpoints TEXT ,hitdice TEXT,weapon1 TEXT, atkbonus1 TEXT, " +
    "dmg1 TEXT,weapon2 TEXT,atkbonus2 TEXT,dmg2 TEXT ,weapon3 TEXT,atkbonus3 TEXT,dmg3 TEXT,cp INTEGER,sp INTEGER,ep INTEGER,gp INTEGER,pp INTEGER,equipmenttextarea TEXT, " +
    "personality TEXT,ideals TEXT,bonds TEXT,flaws TEXT, features TEXT, FOREIGN KEY(username) REFERENCES users (username))"
);

db.run(
  "CREATE TABLE IF NOT EXISTS spellsheet(spellscastingability INTEGER, spellsavedc INTEGER, spellattackbonus TEXT, cantrip TEXT, lvl1spells TEXT, lvl2spells TEXT, lvl3spells TEXT, lvl4spells TEXT, lvl5spells TEXT, lvl6spells TEXT, lvl7spells TEXT, lvl8spells TEXT, lvl9spells TEXT,name TEXT UNIQUE, FOREIGN KEY(name) REFERENCES characters (name))"
);

const port = process.env.Port || 3001;

app.post("/register", (req, res) => {
  const { email, username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.get(
    "SELECT * FROM users WHERE username =? OR email = ?",
    [username, email],
    (err, row) => {
      if (err) {
        res.status(500).send({ message: "Database error" });
      } else if (row) {
        res.send({ message: "Username or Email already exists" });
      } else {
        db.run(
          "INSERT INTO users (email, username, password) VALUES (?,?,?)",
          [email, username, hashedPassword],
          (err) => {
            if (err) {
              res.status(500).send({ message: "Database error" });
            } else {
              res.send({ message: "User  created successfully" });
            }
          }
        );
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      res.status(500).send({ message: "Database error" });
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

app.post("/menu", (req, res) => {
  const { buttonname, username } = req.body;
  db.get(
    "SELECT * FROM characters WHERE name = ?",
    [buttonname],
    (err, row) => {
      if (!buttonname) {
        console.error("Database error on SELECT:", err);
        res.status(400).send({ message: "Character name is required" });
      } else if (err) {
        console.error("Database error on SELECT:", err);
        res.status(500).send({ message: "Database error" });
      } else if (row) {
        res.send({ message: "Character already exists" });
      } else {
        db.run(
          "INSERT INTO characters (name, username) VALUES (?, ?)",
          [buttonname, username],
          (err) => {
            if (err) {
              console.error("Database error on INSERT:", err);
              res.status(500).send({ message: "Database error" });
            } else {
              res.send({ message: "Character created successfully" });
            }
          }
        );
      }
    }
  );
});

app.delete("/menu/:name", (req, res) => {
  const { name } = req.params;
  db.run("DELETE FROM characters WHERE name = ?", [name], (err) => {
    if (err) {
      console.error("Database error on DELETE:", err);
      res.status(500).send({ message: "Database error" });
    } else {
      res.send({ message: "Character deleted successfully" });
    }
  });
  db.run("DELETE FROM spellsheet WHERE name = ?", [name], (err) => {});
});

app.put("/menu/:name", (req, res) => {
  const { name } = req.params;
  const { newName } = req.body;

  db.get("SELECT * FROM characters WHERE name = ?", [newName], (err, row) => {
    if (row) {
      return res
        .status(400)
        .send({ message: "Character name already exists!" });
    }

    db.run(
      "UPDATE characters SET name = ? WHERE name = ?",
      [newName, name],
      (err) => {
        if (err) {
          console.error("Database error on UPDATE:", err);
          res.status(500).send({ message: "Database error" });
        } else {
          res.send({ message: "Character updated successfully", newName });
        }
      }
    );
    db.run("UPDATE spellsheet SET name = ? WHERE name = ?", [newName, name]);
  });
});

app.get("/menu/:username", (req, res) => {
  const username = req.params.username;
  db.all(
    "SELECT name FROM characters WHERE username = ?",
    [username],
    (err, rows) => {
      if (err) {
        console.error("Database error on SELECT:", err);
        res.status(500).send({ message: "Database error" });
      } else {
        res.send(rows);
      }
    }
  );
});

app.post("/sheet", (req, res) => {
  const {
    name,
    classlevel,
    background,
    race,
    alignment,
    experience,
    strengthmod,
    strengthnumber,
    dexteritymod,
    dexteritynumber,
    constitutionmod,
    constitutionnumber,
    intelligencemod,
    intelligencenumber,
    wisdommod,
    wisdomnumber,
    charismamod,
    charismanumber,
    inspiration,
    proficiencybonus,
    strengthsavingthrow,
    dexteritysavingthrow,
    constitutionsavingthrow,
    intelligencesavingthrow,
    wisdomsavingthrow,
    charismasavingthrow,
    acrobaticscheck,
    acrobatics,
    animalhandlingcheck,
    animalhandling,
    arcanacheck,
    arcana,
    athleticscheck,
    athletics,
    deceptioncheck,
    deception,
    historycheck,
    history,
    insightcheck,
    insight,
    intimidationcheck,
    intimidation,
    investigationcheck,
    investigation,
    medicinecheck,
    medicine,
    naturecheck,
    nature,
    perceptioncheck,
    perception,
    perfomancecheck,
    perfomance,
    persuasioncheck,
    persuasion,
    religioncheck,
    religion,
    sleightofhandscheck,
    sleightofhands,
    stealthcheck,
    stealth,
    survivalcheck,
    survival,
    passivewisdom,
    proficienciestextarea,
    armor,
    initiative,
    speed,
    currenthitpoints,
    temporaryhitpoints,
    hitdice,
    weapon1,
    atkbonus1,
    dmg1,
    weapon2,
    atkbonus2,
    dmg2,
    weapon3,
    atkbonus3,
    dmg3,
    cp,
    sp,
    ep,
    gp,
    pp,
    equipmenttextarea,
    ideals,
    bonds,
    flaws,
  } = req.body;
  db.run(
    "UPDATE characters SET classlevel = ?, background = ?, race = ?, alignment = ?, experience = ?, strengthmod = ?, strengthnumber = ?, dexmod = ?, dexnumber =?, constitutionmod = ?, constitutionnumber = ?, intelligencemod = ?, intelligencenumber = ?, wisdommod = ?, wisdomnumber = ?, charismamod = ?, charismanumber = ?, inspiration = ?, proficiencybonus = ?, strengthsavingthrow = ?, dexteritysavingthrow = ?, constitutionsavingthrow = ?, intelligencesavingthrow = ?, wisdomsavingthrow = ?, charismasavingthrow = ?, acrobaticscheck = ?, acrobatics = ?, animalhandlingcheck = ?, animalhandling = ?, arcanacheck = ?, arcana = ?, athleticscheck = ?, athletics = ?, deceptioncheck = ?, deception = ?, historycheck = ?, history = ?, insightcheck = ?, insight = ?, intimidationcheck = ?, intimidation = ?, investigationcheck = ?, investigation = ?, medicinecheck = ?, medicine = ?, naturecheck = ?, nature = ?, perceptioncheck = ?, perception = ?, perfomancecheck = ?, perfomance = ?, persuasioncheck = ?, persuasion = ?, religioncheck = ? , religion = ?," +
      " sleightofhandscheck = ?, sleightofhands = ?, stealthcheck = ?, stealth = ?, survivalcheck = ?, survival = ?, passivewisdom = ?, proficienciestextarea = ?, armor = ?, initiative = ?, speed = ?, currenthitpoints = ?, temporaryhitpoints = ?, hitdice = ?, weapon1 = ?, atkbonus1 = ?, dmg1 = ?, weapon2 = ?, atkbonus2 = ?, dmg2 = ?, weapon3 = ?, atkbonus3 = ?, dmg3 = ?, cp = ?, sp = ?, ep = ?, gp = ?, pp = ?, equipmenttextarea = ?, " +
      " ideals = ?, bonds = ?, flaws = ?  WHERE name = ?",
    [
      classlevel,
      background,
      race,
      alignment,
      experience,
      strengthmod,
      strengthnumber,
      dexteritymod,
      dexteritynumber,
      constitutionmod,
      constitutionnumber,
      intelligencemod,
      intelligencenumber,
      wisdommod,
      wisdomnumber,
      charismamod,
      charismanumber,
      inspiration,
      proficiencybonus,
      strengthsavingthrow,
      dexteritysavingthrow,
      constitutionsavingthrow,
      intelligencesavingthrow,
      wisdomsavingthrow,
      charismasavingthrow,
      acrobaticscheck,
      acrobatics,
      animalhandlingcheck,
      animalhandling,
      arcanacheck,
      arcana,
      athleticscheck,
      athletics,
      deceptioncheck,
      deception,
      historycheck,
      history,
      insightcheck,
      insight,
      intimidationcheck,
      intimidation,
      investigationcheck,
      investigation,
      medicinecheck,
      medicine,
      naturecheck,
      nature,
      perceptioncheck,
      perception,
      perfomancecheck,
      perfomance,
      persuasioncheck,
      persuasion,
      religioncheck,
      religion,
      sleightofhandscheck,
      sleightofhands,
      stealthcheck,
      stealth,
      survivalcheck,
      survival,
      passivewisdom,
      proficienciestextarea,
      armor,
      initiative,
      speed,
      currenthitpoints,
      temporaryhitpoints,
      hitdice,
      weapon1,
      atkbonus1,
      dmg1,
      weapon2,
      atkbonus2,
      dmg2,
      weapon3,
      atkbonus3,
      dmg3,
      cp,
      sp,
      ep,
      gp,
      pp,
      equipmenttextarea,
      ideals,
      bonds,
      flaws,
      name,
    ],
    (err) => {
      if (err) {
        console.error("Database error on UPDATE:", err);
        res.status(500).send({ message: "Database error" });
      } else {
        res.send({ message: "Character data saved succesfully" });
      }
    }
  );
});

app.get("/sheet/:name", (req, res) => {
  const name = req.params.name;
  db.get("SELECT * FROM characters WHERE name = ?", [name], (err, rows) => {
    if (err) {
      console.error("Database error on SELECT:", err);
      res.status(500).send({ message: "Database error" });
    } else {
      res.send(rows);
    }
  });
});

app.post("/spellsheet", (req, res) => {
  const {
    name,
    spellscastingability,
    spellsavedc,
    spellattackbonus,
    cantrip,
    lvl1spells,
    lvl2spells,
    lvl3spells,
    lvl4spells,
    lvl5spells,
    lvl6spells,
    lvl7spells,
    lvl8spells,
    lvl9spells,
  } = req.body;
  db.run(
    "UPDATE spellsheet SET spellscastingability = ? , spellsavedc = ? , spellattackbonus = ? , cantrip = ? , lvl1spells = ?, lvl2spells = ?, lvl3spells = ?, lvl4spells = ?, lvl5spells = ?, lvl6spells = ?, lvl7spells = ?, lvl8spells = ?, lvl9spells = ? WHERE name = ?",
    [
      spellscastingability,
      spellsavedc,
      spellattackbonus,
      cantrip,
      lvl1spells,
      lvl2spells,
      lvl3spells,
      lvl4spells,
      lvl5spells,
      lvl6spells,
      lvl7spells,
      lvl8spells,
      lvl9spells,
      name,
    ],
    (err) => {
      if (err) {
        console.error("Database error on UPDATE:", err);
        res.status(500).send({ message: "Database error" });
      } else {
        res.send({ message: "Character data saved succesfully" });
      }
    }
  );
});

app.get("/spellsheet/:name", (req, res) => {
  const name = req.params.name;
  db.get("SELECT * FROM spellsheet WHERE name = ?", [name], (err, rows) => {
    if (err) {
      console.error("Database error on SELECT:", err);
      res.status(500).send({ message: "Database error" });
    } else if (!rows) {
      db.run("INSERT INTO spellsheet (name) VALUES (?)", [name], (err) => {
        if (err) {
          console.error("Database error on INSERT:", err);
          res.status(500).send({ message: "Database error" });
        } else {
          db.get(
            "SELECT * FROM spellsheet WHERE name = ?",
            [name],
            (err, rows) => {
              res.send(rows);
            }
          );
        }
      });
    } else {
      res.send(rows);
    }
  });
});

app.post("/passwordreset/:username", async (req, res) => {
  const username = req.params.username;
  const resetToken = crypto.randomInt(100000, 999999).toString();
  const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiry

  db.get(
    "SELECT email FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err) return res.status(500).send({ message: "Database error" });
      if (!row) return res.status(404).send({ message: "Username not found" });

      db.run(
        "UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE username = ?",
        [resetToken, resetTokenExpires, username],
        (updateErr) => {
          if (updateErr)
            return res.status(500).send({ message: "Database error" });

          const mailOptions = {
            from: "justfortest383@gmail.com",
            to: row.email,
            subject: "Test2",
            html: `<p>Your OTP Code: ${resetToken}</p><p><img width={100} src="cid:test"/></p>`,
            attachments: [
              {
                filename: "image.jpg",
                path: path.join(__dirname, "test.jpg"),
                cid: "test",
              },
            ],
          };
          transporter.sendMail(mailOptions, (error) => {
            if (error)
              return res.status(500).send({ message: "Error sending email" });

            res.send({
              message: "OTP sent to email",
              success: true,
              resetToken,
            }); // ⚠️ Remove resetToken in production
          });
        }
      );
    }
  );
});

app.post("/verifyotp", async (req, res) => {
  const { username, otp } = req.body;

  db.get(
    "SELECT resetToken, resetTokenExpires FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) return res.status(500).send({ message: "Database error" });
      if (!row) return res.status(404).send({ message: "Username not found" });
      if (!row.resetToken || Date.now() > Number(row.resetTokenExpires)) {
        return res.status(400).send({ message: "OTP expired or invalid" });
      }
      if (row.resetToken !== otp) {
        return res.status(400).send({ message: "Incorrect OTP" });
      }

      res.send({ message: "OTP verified successfully", success: true });
    }
  );
});

app.post("/updatepassword", async (req, res) => {
  const { username, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).send({ message: "New password is required" }); // 🚨 Prevents undefined errors
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run("UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE username = ?", 
      [hashedPassword, username], 
      (err) => {
        if (err) return res.status(500).send({ message: "Database error" });

        res.send({ message: "Password updated successfully", success: true });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send({ message: "Server error while updating password" });
  }
});

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
