// Checks if user is in a database by user's email
function getUserByEmail(email, database) {
  let user = null;
  for (let i in database) {
    let person = database[i];
    if (person.email === email) {
      user = person;
      break;
    }
  }
  return user;
};

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

// Returns obj with urls which have same userID
function urlsForUser(id, database) {
  const newObj = { ...database };
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser, addUser };