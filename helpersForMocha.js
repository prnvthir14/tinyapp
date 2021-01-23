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

const checkForEmail = function (emailToCheck, userDatabse){

  for (let x in userDatabse){  

    if(emailToCheck === userDatabse[x].email){
      //if email exists, return true
      return userDatabse[x].id;
  
    }  
  }
  return false;
}

module.exports = {checkForEmail}