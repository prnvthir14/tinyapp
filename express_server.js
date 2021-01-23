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

  //console.log(myAppUsers)

  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login')
    
  } else {

    const templateVars = {user: myAppUsers[req.session.user_id]}

    res.redirect("/urls");

  }    
  
})



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


  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.render("registration", templateVars);
    
    } else {
    //if logged in, go to the users URLS
    res.render("urls_index", templateVars);

  }

})


// route #11
app.post('/register', (req,res) => {

  // console.log(req.body.email) // returns email provided by user
  // console.log(req.body.password) // returns pw provided by user

  //f the e-mail or password are empty strings, send back a response with the 400 status code.
  //console.log(myAppUsers)
  //if email or pw are empty, return 400
  let userEnteredEmail = req.body.email;
  let userEnteredPassword = req.body.password;
  let userEnteredPasswordHashed = bcrypt.hashSync(userEnteredPassword, 10)
  
  //
  //need to pass 
  //if email is empty, or password is empty or checkForExistingEmail true (email exists) then return status code..
  if ( ((userEnteredEmail) === '') || ((userEnteredPassword) === '') || ((checkForEmail(userEnteredEmail, myAppUsers))) === true) {
    
    res.send('Status Code: 400');
  
  } else {
    //register user

    let userId = generateRandomString();

      
    //set cookie to remember userID
    //res.cookie('user_id', userId )
    req.session.user_id = userId; 

    myAppUsers[userId]={
  
      'id': userId,
      'email' : userEnteredEmail,
      'password' : userEnteredPasswordHashed
    }
    //redirect to
    res.redirect('/urls')
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


  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.render("login", templateVars);
    
    } else {
    //if logged in, go to the users URLS
    res.render("urls_index", templateVars);

  }

});

// ROUTE #8 by sequence.. 
app.post('/login', (req,res) => {
  
  //console.log(req.body)
  //grab username entered
  //no longer using the username.. switching to email after form update.
  // let userNameToStore = req.body.username;
  //console.log(userNameToStore)
  let attemptedLoginEmail = req.body.email;
  let attemptedLoginPassword = req.body.password;

  //after storing cookie, return to redirect
  // res.redirect(`/urls`)
  if (checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers) !== false){

    let userId = checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword, myAppUsers);
    //store user ID cookie  
    //es.cookie('user_id', userId )
    req.session.user_id = userId; 


    //redirect to /urls -- looks like something needs to be passed here so that 
    //the logic in the header partial gets activated when
    res.redirect('/urls')

  } else {

    res.status(403).redirect("/login")
    console.log('403 Forbidden: Username or password is incorrect.')

  }

});

//route #9 - logout route
app.post('/logout', (req,res) =>{


  // res.cookie('username','')
  // res.clearCookie('user_id')
  req.session = null;
  // // //
  // res.redirect('/urls')

  // res.cookie('username', '' )

  res.redirect('/urls')

})

// ROUTE #1
// /urls - route page that displays all short URL and Long URLs in our urlDatabase. - VERIFIED 
app.get('/urls', (req,res) => {
  
  //get access to cookies from request
  cookiesObject = req.session;

  
  const userIDFromSession = req.session.user_id
  //console.log(userIDFromSession ,'aaaaaaa');
  
  // console.log('-----------');


  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login')
    
  } else {

    //call function to return only urls for that user.. 
    let urlsToPass = returnURLsForThisUser(userIDFromSession, urlDatabase, myAppUsers);

    //console.log(myAppUsers)
    
    //console.log(myAppUsers[userIDFromSession])
    
    const templateVars = 
    { urls: urlsToPass, user: myAppUsers[req.session.user_id]
      
    };
    //console.log(templateVars)  
    res.render("urls_index", templateVars);

  }

}); 

// ROUTE #2
//GET route to render the urls_new.ejs template.
// /urls/new route needs to be defined before the GET /urls/:id r
app.get("/urls/new", (req, res) => {

  cookiesObject = req.session;

  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login')
    
  } else {

    const templateVars = {user: myAppUsers[req.session.user_id]}

    res.render("urls_new", templateVars);

  }


});

//ROUTE for this post matches route #1...
//POST route to handle the submission.
//route #2 & #3 are separate routes... note that we alread have defined a app.ger for route #3 (route #1)

//route#2's ejs template (urls_new) contains a form object which upon submission invokes route#3..
 
//ROUTE 3 // this is what gets executed after user submits url to be shortened//
//and where the url DB gets updated... 
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //req.body needs to be added as a value to our URL DB
  //declare and generate new key/tinyURL;
  cookiesObject = req.session;
  let userIDFromCookie = cookiesObject.user_id

  let newKeyAKAShortURL = generateRandomString();

  //req.body.longURL; what the user enters in the submission box
  
  //original
  //urlDatabase[(newKeyAKAShortURL)] = req.body.longURL;

  //updated to now store the long URL and userID that generated it.. 
  //console.log(req.session.user_id)
  urlDatabase[newKeyAKAShortURL] = {longURL: req.body.longURL, userID : userIDFromCookie }


  //is this the location response header??
  //redirect sends this to route #3
  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});

////
//need to commit - changes to route 4 + helper fns

//ROUTE #4
//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  let cookiesObject = req.session;

  let urlsForUserID = returnURLsForThisUser(cookiesObject.user_id, urlDatabase) 
  //console.log(Object.keys(urlsForUserID).length)


  let user = myAppUsers[cookiesObject.user_id];//{ id: '12345', email: 'user@example.com', password: 'purple' }

 
  let userIDFromCookie = cookiesObject.user_id
  //console.log(urlDatabase)
  // console.log(userIDFromCookie) // FflRc5 - matches myAppuser prnvthir
  // console.log(urlsForUserID) // empty... should have have cnn.com

  let shortURL = req.params.shortURL; //:id from url i.e. [ 'bWYDw2' ]
  // console.log(req.params.shortURL)
  // console.log(shortURL)
  let longURL = urlsForUserID[shortURL].longURL //.
  
  // console.log(shortURL) // jXIpLY - correct, matches key after url is generatef
  // //this long url is undefined because urlsForUserID is empty but it should have cnn.com in it.. since it is empty we are redirecting to urls/new 
  // console.log(longURL) 
  

  //if not logged in, redirect to login.
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

//inputEmail = req.body.email when checkForExistingEmail is called in the route.. 
//userDatabse = myAppUsers when checkForExistingEmail is called in the route.. 
//generatedUserId


//ROUTE #5
//add route to redirect to to website given a shortURL discriptor in the url
app.get("/u/:shortURL", (req, res) => {

  //need to fix this part since the structure of urlDatabase has changed//


  const templateVars = {user: myAppUsers[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
 
  if (urlDatabase[req.params.shortURL]){

  //use shortURL to provide long url...
  res.redirect(templateVars.longURL);
 

  } else {

    res.send('The url Does not exist');

  }

});


//route #12 
//app.post that gets requested once the edite button on /urls gets clicked.

app.post('/urls/:shortURL/edit', (req,res) => {

  // console.log('hi');
  // console.log(req.params.shortURL)//
  // console.log(req.body.longURL)//

  let cookiesObject = req.session;
  let userIDFromCookie = cookiesObject.user_id

  let shortURL = req.params.shortURL
  let updatedLongURL = req.body.longURL;
  
  //update database with new long URL
  urlDatabase[shortURL] = {longURL: updatedLongURL, userID: userIDFromCookie}
  // // res.send('hi, we are about to inintate a delete')
  //confirmed that post request is initiated after click.
  //delete urlDatabase[req.params.shortURL];

  res.redirect(`/urls`)


});

//route #6 
//app.post that gets requested once the delete button on /urls gets clicked.
app.post('/urls/:shortURL/delete', (req,res) => {

  // console.log('hi');
  // res.send('hi, we are about to inintate a delete')
  //confirmed that post request is initiated after click.
  delete urlDatabase[req.params.shortURL];

  res.redirect(`/urls`)


});

//route #7 
//app.post that gets requested once the delete button on /urls gets clicked.
app.post('/urls/:id', (req,res) => {

  //console.log(req.body) //- contains shortURL: 'key'
  //once our edit button is clicked, this route gets initated
  const shortURL = req.params.id;
  const letNewLongURL = req.body.longURL;
  
  urlDatabase[shortURL] = letNewLongURL;
  
  ////need to update URL 
  //first redirect to /urls/:shortURL
  res.redirect(`/urls`)
  // console.log(req.body)

});


