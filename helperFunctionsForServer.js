//list of function declartations. Functions are exported and used in express_server

//express, cookieSession and bcrypt needed for login functions
//cookiesession to read incoming client cookies and encrypt userID. 
const express = require("express");
const app = express ();


const cookieSession = require('cookie-session')

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

//bcrypt to 
const bcrypt = require('bcrypt');


// 1 - generateRandomString ; used to generate random userID for new users and to generate shortURL for newly registered URLs

const generateRandomString = () => {

  let randomString = '';
  let lengthOfTinyURL = 6;

  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < lengthOfTinyURL; i++){

    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));

  }

  return randomString;

}

// 2 function to check for existing emails. Used when registering new users and during login.
const checkForEmail = function (emailToCheck, userDatabse){

  for (let x in userDatabse){  

    if(emailToCheck === userDatabse[x].email){
      //if email exists, return true
      return true;
  
    }  
  }
  return false;
}

// 3 function to control login. first uses checkForEmail to confirm a valid email before comparing passwords.
const checkLoginDetails = (attemptedLoginEmail, attemptedLoginPassword, userDatabse) => {  

  for (let users in userDatabse){ 

     if (checkForEmail(attemptedLoginEmail,userDatabse)){
      //works for true case console.log('imhere')
      if (bcrypt.compareSync(attemptedLoginPassword,(userDatabse[users].password)) ){
        //if true and login is successful, return the suer_ud to store in cookie//
        return userDatabse[users].id
                
      }

    }
    
  } 
  return false; 

}

// 4 function that will compare userId stored in cookie with userID in urlDatabase.. to be called in /urls get route
const returnURLsForThisUser = (UserIDFromCookie, myURLDatabase, userDatabse) => {

  //empty object to store required kvps from urlDatabase
  let urlDatabasePerUser = {};

  for (let key in myURLDatabase) { 
   
    if (UserIDFromCookie === myURLDatabase[key].userID){
    
      urlDatabasePerUser[key] = myURLDatabase[key];

    }
  } 
  return urlDatabasePerUser;
}




module.exports = {generateRandomString, checkForEmail, checkLoginDetails, returnURLsForThisUser }