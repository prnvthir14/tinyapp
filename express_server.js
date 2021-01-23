//import and require the following libraries and functions:

//initialize our app server
const express = require("express");
const app = express ();

//default port to listen to.
const PORT = 8080;

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

//using ejs as our apps templating engine
app.set("view engine", "ejs");

//cookiesession to read incoming client cookies and encrypt userID. 
const cookieSession = require('cookie-session');

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

//body parser; incoming HTML
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

//bcrypt to 
const bcrypt = require('bcrypt');

//helper functions 
const {generateRandomString, checkForEmail, checkLoginDetails, returnURLsForThisUser, checkShortURL } = require('./helperFunctionsForServer');

const urlDatabase = {
  "b2xVn2": {longURL : "http://www.lighthouselabs.ca", userID: '12345'},
  "b2xVaz": {longURL : "http://www.skypsports.com", userID: '12345'},
  "b2xVqq": {longURL : "http://www.espncricinfo.com", userID: '12345'},
  "9sm5xK": {longURL : "http://www.google.com", userID: 'FflRc5'},
  "7sAAxK": {longURL : "http://www.cnn.com", userID: 'FflRc5'},  
  "9sCCxK": {longURL : "http://www.yahoo.ca", userID: 'FflRc5'}
};


//test userdatabase objcet
const myAppUsers = { 
  "12345": {
    id: "12345", 
    email: "user@example.com", 
    password: "purple"
  },
 "54321": {
    id: "54321", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "FflRc5": {
    id: "FflRc5", 
    email: "prnvthir@gmail.com", 
    password: "$2b$10$CupvDxb.WQkf85UhMT72mOcooEajdh6TYK7eTgg5nIKAo6VFPNxAi"

  }
};


//route 0 to home page.. if userId cookies present, go to /urls else redirect to login page
app.get('/', (req,res) => {

  cookiesObject = req.session;

  if (Object.keys(cookiesObject).length === 1) {
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login');
    
  } else {

    res.redirect("/urls");

  }    
  
});

app.get('/register', (req,res) => {

  //get access to cookies from request
  cookiesObject = req.session;
  const userIDFromSession = req.session.user_id;
  //call function to return only urls for that user.. 
  let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

  const templateVars = 
  { urls: urlsToPass, 
    user: myAppUsers[req.session.user_id]
  };


  if (Object.keys(cookiesObject).length === 1) {
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.render("registration", templateVars);
    
    } else {
    //if logged in, go to the users URLS
    res.render("urls_index", templateVars);

  }

})


// route #11
app.post('/register', (req,res) => {

  let userEnteredEmail = req.body.email;
  let userEnteredPassword = req.body.password;
  let userEnteredPasswordHashed = bcrypt.hashSync(userEnteredPassword, 10)
  

  //if email is empty, or password is empty or checkForExistingEmail true (email exists) then return status code..
  if (((userEnteredEmail) === '') || ((userEnteredPassword) === '') || ((checkForEmail(userEnteredEmail, myAppUsers))) === true) {
    
    res.send('Status Code: 400');
  
  } else {
    //register user

    let userId = generateRandomString();
     
    //set cookie to remember userID
    req.session.user_id = userId; 

    myAppUsers[userId]={
  
      'id': userId,
      'email' : userEnteredEmail,
      'password' : userEnteredPasswordHashed
    }
    //redirect to
    res.redirect('/urls');
  }

})


// route #12
app.get('/login', (req,res) => {

  //get access to cookies from request
  cookiesObject = req.session;
  const userIDFromSession = req.session.user_id;

  //call function to return only urls for that user.. 
  let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

  const templateVars = 
  { urls: urlsToPass, 
    user: myAppUsers[req.session.user_id]
  };

  if (Object.keys(cookiesObject).length === 1) {
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.render("login", templateVars);
    
    } else {
    //if logged in, go to the users URLS
    res.render("urls_index", templateVars);

  }

});

// ROUTE #8 by sequence.. 
app.post('/login', (req,res) => {
  
  let attemptedLoginEmail = req.body.email;
  let attemptedLoginPassword = req.body.password;

  //get access to cookies from request
  cookiesObject = req.session;
  const userIDFromSession = req.session.user_id;

  //call function to return only urls for that user.. 
  let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

  const templateVars = 
  { urls: urlsToPass, 
    user: myAppUsers[req.session.user_id]
  };

  if (checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers) !== false){

    let userId = checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers);
    //store session cookie as userID already stored in our DB during user registration
    req.session.user_id = userId; 

    res.redirect('/urls');

  } else if (checkForEmail(attemptedLoginEmail, myAppUsers) === false) {
    //if email is not regitsered, render newRegistration page
    res.render("not_registered", templateVars)

  } else if (checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers) === false) {
    //case when login is unsuccsefull
    res.render("unsucsessfull_Login", templateVars)

  } 

});

//route #9 - logout route
app.post('/logout', (req,res) =>{
  //clear cookies
  req.session = null;
  
  // res.redirect('/login')
  res.redirect('/login')

})

// ROUTE #1
// /urls - route page that displays all short URL and Long URLs in our urlDatabase. - VERIFIED 
app.get('/urls', (req,res) => {
  
  //get access to cookies from request
  cookiesObject = req.session;
  
  const userIDFromSession = req.session.user_id

  if (Object.keys(cookiesObject).length === 1) {

    res.redirect ('/login')
    
  } else {

    let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

    const templateVars = 
    { urls: urlsToPass, 
      user: myAppUsers[req.session.user_id]  
    };

    res.render("urls_index", templateVars);

  }

}); 

// ROUTE #2
//GET route to render the urls_new.ejs template.
// /urls/new route needs to be defined before the GET /urls/:id r
app.get("/urls/new", (req, res) => {

  cookiesObject = req.session;

  if (Object.keys(cookiesObject).length === 1) {

    res.redirect ('/login')
    
  } else {

    const templateVars = {user: myAppUsers[req.session.user_id]}

    res.render("urls_new", templateVars);

  }

});


//ROUTE 3 // this is what gets executed after user submits url to be shortened//
//and where the url DB gets updated... 
app.post("/urls", (req, res) => {

  cookiesObject = req.session;
  let userIDFromCookie = cookiesObject.user_id;

  let newKeyAKAShortURL = generateRandomString();

  urlDatabase[newKeyAKAShortURL] = {longURL: req.body.longURL, userID : userIDFromCookie };

  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});

//ROUTE #4
//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  let cookiesObject = req.session;
  let urlsForUserID = returnURLsForThisUser(cookiesObject.user_id, urlDatabase); 
  let user = myAppUsers[cookiesObject.user_id]; 
  let userIDFromCookie = cookiesObject.user_id;
  let shortURL = req.params.shortURL; 
  let longURL = urlsForUserID[shortURL].longURL;

  if (Object.keys(cookiesObject).length === 1){

    res. redirect('/login');
    
  } else if (Object.keys(urlsForUserID).length === 0) {
    //no urls for this user but is logged in, go to create new urls page
    res. redirect('/urls/new');
  } else {
    //if logged in and urlsForUserID is not empty:
    if (checkShortURL(urlsForUserID,shortURL, userIDFromCookie)){

      const templateVars = {user,shortURL,longURL };   
      res.render("urls_show", templateVars);

      } else {

      //send message saying you dont have access to this address. Please login to see your URLs or enter another shortURL
      res.send('You dont have access to this address. Please login to see your URLs or enter another shortURL')
    }

  }

});

//ROUTE #5
//add route to redirect to to website given a shortURL discriptor in the url
app.get("/u/:shortURL", (req, res) => {

  const templateVars = {user: myAppUsers[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
 
  if (urlDatabase[req.params.shortURL]) {

  //use shortURL to provide long url...
  res.redirect(templateVars.longURL);
 
  } else {

    res.send('The url Does not exist');

  }

});


//route #12 
//app.post that gets requested once the edite button on /urls gets clicked.

app.post('/urls/:shortURL/edit', (req,res) => {

  let cookiesObject = req.session;
  let userIDFromCookie = cookiesObject.user_id

  let shortURL = req.params.shortURL;
  let updatedLongURL = req.body.longURL;
  
  //update database with new long URL
  urlDatabase[shortURL] = {longURL: updatedLongURL, userID: userIDFromCookie}

  res.redirect(`/urls`);

});

//route #6 
//app.post that gets requested once the delete button on /urls gets clicked.
app.post('/urls/:shortURL/delete', (req,res) => {

  delete urlDatabase[req.params.shortURL];

  res.redirect(`/urls`);

});

//route #7 
//app.post that gets requested once the delete button on /urls gets clicked.
app.post('/urls/:id', (req,res) => {

  const shortURL = req.params.id;
  const letNewLongURL = req.body.longURL;
  
  urlDatabase[shortURL] = letNewLongURL;
  
  res.redirect(`/urls`)

});


