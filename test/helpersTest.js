const { assert } = require('chai');

const {
  //generateRandomString,
  emailInUsers,
  //shortURLinUsers,
  // authenticateUser,
  // urlsForUser
} = require('../helpers.js');


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

describe('emailInUsers', function() {
  it('should return a user with valid email', function() {
    const user = emailInUsers(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";

    assert.equal(user, expectedOutput, ' === ');
  });

  it('should return false if passed invalid email', function() {
    const user = emailInUsers(testUsers, "NOTuser@example.com");
    const expectedOutput = false;

    assert.equal(user, expectedOutput, ' === ');
  });
});