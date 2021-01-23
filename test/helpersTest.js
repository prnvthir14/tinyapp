//test 

const { assert } = require('chai');

const { checkForEmail } = require('../helpersForMocha');

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

//if user exists, return userID
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkForEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal (user, expectedOutput)
  });
});


//a non-existent email returns undefined
describe('getUserByEmail', function() {
  it('should return undefined if user doesnt exist', function() {
    const user = checkForEmail("user122222@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal (user, expectedOutput, 'expected these to be equal' )
  });
});

