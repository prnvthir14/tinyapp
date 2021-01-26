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
const {generateRandomString, checkForEmail, checkLoginDetails, returnURLsForThisUser, checkShortURLExists, checkURLOwner } = require('./helperFunctionsForServer');

////TEST DATA 
//testURLDatabse:
const urlDatabase = {
  //test that user does not own these ID's
  "b2xVn2": {longURL : "http://www.lighthouselabs.ca", userID: '12345'},
  "b2xVaz": {longURL : "http://www.skypsports.com", userID: '12345'},
  "b2xVqq": {longURL : "http://www.espncricinfo.com", userID: '12345'},
  //user owns these ID's
  "9sm5xK": {longURL : "http://www.google.com", userID: 'FflRc5'},
  "7sAAxK": {longURL : "http://www.cnn.com", userID: 'FflRc5'},  
  "9sCCxK": {longURL : "http://www.yahoo.ca", userID: 'FflRc5'}
};


//test userdatabase objcets
const myAppUsers = { 
//   "12345": {
//     id: "12345", 
//     email: "user@example.com", 
//     password: "purple"
//   },
//  "54321": {
//     id: "54321", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   },
  "FflRc5": {
    id: "FflRc5", 
    //test email ID
    email: "prnvthir@gmail.com", 
    //user enters 'arsenal' for test
    password: "$2b$10$CupvDxb.WQkf85UhMT72mOcooEajdh6TYK7eTgg5nIKAo6VFPNxAi"
    
  }
};

//get the urls page if the user is logged in, otherwise redirect the me to the login page.
app.get('/', (req,res) => {

  cookiesObject = req.session;

  if (Object.keys(cookiesObject).length === 1) {

    res.redirect ('/login');
    
  } else {

    res.redirect("/urls");

  }    
  
});

//get the user to the registration page if not logged in. if logged in, get the urls home page.
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
 
    res.render("registration", templateVars);
    
    } else {
    //if logged in, go to the users URLS
    res.redirect('/urls');

  }

})


// post register: 
app.post('/register', (req,res) => {

  let userEnteredEmail = req.body.email;
  let userEnteredPassword = req.body.password;
  let userEnteredPasswordHashed = bcrypt.hashSync(userEnteredPassword, 10);

  // empty templatevars to render header on page.
  const templateVars = 
  { urls: [], 
    user: []
  };
  
  //if email is empty, or password is empty render bad_registration_fieldsNotComplete with form to regregister. 
  if (((userEnteredEmail) === '') || ((userEnteredPassword) === '')){
    
    res.render('bad_registration_fieldsNotComplete',templateVars);

  } else if (((checkForEmail(userEnteredEmail, myAppUsers))) === true) {
    //email has already been registered, render bad_registration_emailAlreadyRegistered
    res.render('bad_registration_emailAlreadyRegistered',templateVars);

  } else {
    //register user and redirect to /urls.

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


// get login page if not logged in, else redirect to /urls if logged in.
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
    res.redirect('/urls');

  }

});

// post login route 
app.post('/login', (req,res) => {
  
  let attemptedLoginEmail = req.body.email;
  let attemptedLoginPassword = req.body.password;

  cookiesObject = req.session;
  const userIDFromSession = req.session.user_id;

  //call function to return only urls for that user.. 
  let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

  const templateVars = 
  { urls: urlsToPass, 
    user: myAppUsers[req.session.user_id]
  };

  if (checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers) !== false) {

    let userId = checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers);
    //store session cookie as userID already stored in our DB during user registration
    req.session.user_id = userId; 

    res.redirect('/urls');

  } else if (checkForEmail(attemptedLoginEmail, myAppUsers) === false) {
    //if email is not regitsered, render newRegistration page
    res.render("not_registered", templateVars)

  } else if (checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers) === false) {
    //case when login is unsuccsefull but the email is registered. 
    res.render("unsucsessfull_Login", templateVars)

  } 

});

// post logout route, clear cookies and redirect to login page.
app.post('/logout', (req,res) =>{
  //clear cookies
  req.session = null;
  
  // res.redirect('/login')
  res.redirect('/login')

})

// route to display URLS for the user that is logged in. if not logged in, user is redirected to a login page. 
app.get('/urls', (req,res) => {
  
  cookiesObject = req.session;
  const userIDFromSession = req.session.user_id;
  let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

  const templateVars = 
  { urls: urlsToPass, 
    user: myAppUsers[req.session.user_id]  
  };

  if (Object.keys(cookiesObject).length === 1) {

    res.render("loginToSee",templateVars)
    
  } else {

    res.render("urls_index", templateVars);

  }

}); 

// route to generate a new shortURL URL for the user that is logged in. if not logged in, user is redirected to a login page. 
app.get("/urls/new", (req, res) => {

  cookiesObject = req.session;
  const templateVars = {user: myAppUsers[req.session.user_id]}

  if (Object.keys(cookiesObject).length === 1) {

    res.render("loginToSee",templateVars)
    
  } else {

    res.render("urls_new", templateVars);

  }

});


//post route initaited once a new URL is submitted to be shortened. 
app.post("/urls", (req, res) => {

  cookiesObject = req.session;
  let userIDFromCookie = cookiesObject.user_id;
  
  //generate new random id for new URL
  let newKeyAKAShortURL = generateRandomString();

  //update URL database. 
  urlDatabase[newKeyAKAShortURL] = {longURL: req.body.longURL, userID : userIDFromCookie };

  //redirect to /urls/:shortURL
  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});

//gets shortURL for a given user. 
app.get("/urls/:shortURL", (req, res) => {

  let cookiesObject = req.session;
  let urlsForUserID = returnURLsForThisUser(cookiesObject.user_id, urlDatabase); 
  let user = myAppUsers[cookiesObject.user_id]; 
  let userIDFromCookie = cookiesObject.user_id;
  let shortURL = req.params.shortURL; 
  
  const templateVars = {user,shortURL};   
  
  if (Object.keys(cookiesObject).length === 1){
    //user not logged in, redirect to login page
    res.redirect('/login');
    
  } else if (Object.keys(urlsForUserID).length === 0) {
    //no urls for this user but is logged in, go to create new urls page
    res.redirect('/urls/new');
  
  } else if (!(checkShortURLExists(shortURL,urlDatabase))){
    //short URL does not exist in db; need to render a page
    res.render('urls_new_redirectWhenURLdoesntExist', templateVars)

  } else if (!(checkURLOwner(shortURL,urlDatabase, userIDFromCookie))) {
    //user does not own shortURL
    res.render('urls_new_redirectWhenURLisNotOwned',templateVars)

  } else {
    //if logged in and urlsForUserID is not empty:
    if (checkURLOwner(shortURL, urlsForUserID, userIDFromCookie)) {
      //if url exists and user is current onwer, render show
      let longURL = urlsForUserID[shortURL].longURL;
      const templateVars1 = {user,shortURL, longURL}
    
      res.render("urls_show", templateVars1);

    } 
  }  

});


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


//app.post that gets requested once the edit button on /urls gets clicked.
app.post('/urls/:shortURL/edit', (req,res) => {

  let cookiesObject = req.session;
  let userIDFromCookie = cookiesObject.user_id
  let shortURL = req.params.shortURL;
  let updatedLongURL = req.body.longURL;
  
  //update database with new long URL
  urlDatabase[shortURL] = {longURL: updatedLongURL, userID: userIDFromCookie}

  res.redirect(`/urls`);

});

//app.post that gets requested once the delete button on /urls gets clicked.
app.post('/urls/:shortURL/delete', (req,res) => {

  delete urlDatabase[req.params.shortURL];

  res.redirect(`/urls`);

});

//app.post that gets requested once the delete button on /urls gets clicked.
app.post('/urls/:id', (req,res) => {

  const shortURL = req.params.id;
  const letNewLongURL = req.body.longURL;
  
  urlDatabase[shortURL] = letNewLongURL;
  
  res.redirect(`/urls`);

});


