const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "bJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: "123",
  },
  bJ48l: {
    id: "bJ48lW",
    email: "b@b.com",
    password: "1234",
  },
};

// middleware 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Returns obj with urls which have same userID
function urlsForUser(id) {
  const newObj = { ...urlDatabase };
  for (let url in newObj) {
    if (newObj[url].userID !== id) {
      delete newObj[url];
    }
  }
  return newObj;
};

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
  const id = req.cookies['user_id'];
  const templateVars = {
    urls: urlsForUser(id),
    user: users[id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = req.cookies['user_id'];

  if (!id) {
    return res.send('unauthorized users can not shorten URLs');
  }
  const shortUrl = generateRandomString();
  const fullUrl = req.body.longURL;
  urlDatabase[shortUrl] = { longURL: fullUrl, userID: id };
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
  const userID = req.cookies['user_id'];
  const urlID = req.params.id;

  if (!userID) {
    return res.status(403).send('Unauthorized users can not delete urls');
  }

  if (!urlDatabase[urlID]) {
    return res.status(400).send('URL does not exist!');
  }

  const urlOwner = urlDatabase[urlID].userID;
  if (userID !== urlOwner) {
    return res.send("Can be delete only by url owner!");
  }
  delete urlDatabase[urlID];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies['user_id'];
  const urlID = req.params.id;
  if (!userID) {
    return res.status(403).send('Unauthorized users can not access urls');
  }

  if (!urlDatabase[urlID]) {
    return res.status(400).send('URL does not exist!');
  }

  const urlOwner = urlDatabase[urlID].userID;
  if (userID !== urlOwner) {
    return res.send("Can be accessed only by url owner!");
  }
  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user: users[req.cookies['user_id']],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies['user_id'];
  const newURL = req.body.newlongURL;
  const shortURL = req.params.id;

  if (!userID) {
    return res.status(403).send('Unauthorized users can not access urls');
  }

  if (!urlDatabase[shortURL]) {
    return res.status(400).send('URL does not exist!');
  }

  const urlOwner = urlDatabase[shortURL].userID;

  if (userID !== urlOwner) {
    return res.send("Can be accessed only by url owner!");
  }

  urlDatabase[shortURL] = { longURL: newURL, userID: userID };

  res.redirect(302, '/urls');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("this URL do not exist!");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});