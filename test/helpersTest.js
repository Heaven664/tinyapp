const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

console.log(typeof getUserByEmail);

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, testUsers[expectedUserID]);
  });

  it('should return null with invalid email', function () {
    const user = getUserByEmail("unvalidemail@example.com", testUsers);
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID);
  });
});