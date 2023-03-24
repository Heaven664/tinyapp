const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, addUser, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080;

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
    password: "$2a$10$aD/LJN4yGT6KVWaN9Vn8UuwY.i8Rwzp21lXHBKuw4gcJ4zgHE3oPK",
  },
  bJ48l: {
    id: "bJ48lW",
    email: "b@b.com",
    password: "1234",
  },
};

// middleware 
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user_id',
  keys: ['secret'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Incorrect username or password");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect username or password");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const id = req.session.user_id;

  if (id) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[id] };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const id = req.session.user_id;
  if (id) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[id] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please provide username and password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("Username exists!");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();

  addUser(users, id, email, hashedPassword);
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(id, urlDatabase),
    user: users[id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = req.session.user_id;

  if (!id) {
    return res.status(403).send('unauthorized users can not shorten URLs');
  }
  const shortUrl = generateRandomString();
  const fullUrl = req.body.longURL;
  urlDatabase[shortUrl] = { longURL: fullUrl, userID: id };
  res.redirect(302, `/urls/${shortUrl}`);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    return res.redirect('/login');
  }
  const templateVars = { user: users[id] };
  res.render('urls_new', templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
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
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
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
    return res.status(400).send("Can be accessed only by url owner!");
  }

  urlDatabase[shortURL] = { userID, longURL: newURL };

  res.redirect(302, '/urls');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("this URL do not exist!");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});