const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "1234",
  },
};

// middleware 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Adds a new user to a database
function addUser(database, userId, userEmail, userPassword) {
  database[userId] = {
    id: userId,
    email: userEmail,
    password: userPassword
  };
}

// Checks if user is in a database by user's email
function getUserByEmail(email) {
  let user = null;
  for (let i in users) {
    let person = users[i];
    if (person.email === email) {
      user = person;
      break;
    }
  }
  return user;
}

// Generates 6 random alpha-numeric characters
function generateRandomString() {
  // Number of characters
  const times = 6;
  let randomString = '';
  // Gets random number between 0 to 35 and generates random alpha-numeric character on base 36(0-z)
  for (let i = 0; i < times; i++) {
    let charIndex = Math.floor(Math.random() * 36);
    let randomChar = charIndex.toString(36);
    if (Math.random() < 0.5) {
      randomString += randomChar.toUpperCase();
    } else {
      randomString += randomChar;
    }
  }
  return randomString;
};

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);

  // If user user not found in database
  if (!user) {
    return res.sendStatus(403);
  }

  // If password is not correct
  if (user.password !== password) {
    return res.sendStatus(403);
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  // redirects to /urls if user is logged in
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  // redirects to /urls if user is logged in
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if user didn't provide password
  if (!email || !password) {
    return res.sendStatus(400);
  }

  // if email exist in database
  if (getUserByEmail(email)) {
    return res.sendStatus(400);
  }

  const id = generateRandomString();
  // adds user to the database
  addUser(users, id, email, password);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    if (!req.cookies['user_id']) {
      return res.send('unauthorized users can not shorten URLs')
    }
  const shortUrl = generateRandomString();
  const fullUrl = req.body.longURL;
  urlDatabase[shortUrl] = fullUrl;
  res.redirect(302, `/urls/${shortUrl}`);
});

app.get("/urls/new", (req, res) => {
  // redirects to /urls if user is NOT logged in
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.newlongURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = newURL;

  res.redirect(302, '/urls');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("this URL do not exist!")
  }
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});