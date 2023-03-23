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
}

module.exports =  getUserByEmail;