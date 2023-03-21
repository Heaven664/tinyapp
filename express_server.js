const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

// Generates 6 random alpha-numeric characters
function generateRandomString() {
  // Number of characters
  const times = 6;
  let randomString = ''
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
  return randomString
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const fullUrl = req.body.longURL;
  urlDatabase[shortUrl] = fullUrl;
  res.redirect(302, `/urls/${shortUrl}`);
})

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});