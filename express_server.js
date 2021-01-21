const express = require("express");

//initialize our app server
const app = express ();

//default port to listen to.
const PORT = 8080;

//using ejs as our apps templating engine
app.set("view engine", "ejs");

//cookieparse - takes in string and outputs object for incoming data...
var cookieParser = require('cookie-parser')
app.use(cookieParser())

//
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

// // test data to work with
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  "b2xVn2": {longURL : "http://www.lighthouselabs.ca", userID: '12345'},
  "9sm5xK": {longURL : "http://www.google.com", userID: '54321'}
};


//generate random alpha numeric 6 digit string for URL
function generateRandomString() {

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


app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

//empty object to store user data on registration
const myAppUsers = { 
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
}



//function to check for existing emails..
const checkForEmail = function (emailToCheck){

  for (let x in myAppUsers){  
  

    if(emailToCheck === myAppUsers[x].email){
      //if email exists, return true
      return true;
  
    }  
  }
  return false;
}

// function to check attempted login credientials against database
const checkLoginDetails = (attemptedLoginEmail, attemptedLoginPassword) => {  

  for (let users in myAppUsers){
      
    //gets us access to all users
    //console.log(myAppUsers[users].email)
    //  console.log(myAppUsers[users].password)
     if (attemptedLoginEmail === myAppUsers[users].email){
      //works for true case console.log('imhere')
      if (attemptedLoginPassword === myAppUsers[users].password){
        //if true and login is successful, return the suer_ud to store in cookie//
        return myAppUsers[users].id
                
      }

    }
    
  } 
  return false; 

}



app.get('/register', (req,res) => {

  res.render('registration')

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

  //
  //need to pass 
  //if email is empty, or password is empty or checkForExistingEmail true (email exists) then return status code..
  if ( ((userEnteredEmail) === '') || ((userEnteredPassword) === '') || ((checkForEmail(userEnteredEmail))) === true) {
    
    res.send('Status Code: 400')
  
  } else {
    //register user

    let userId = generateRandomString();

    myAppUsers[userId]={
  
      'id': userId,
      'email' : req.body.email,
      'password' : req.body.password
    }
  
  
    //set cookie to remember userID
    res.cookie('user_id', userId )
  
  
    //redirect to
    res.redirect('/urls')
  }

})


// route #12
app.get('/login', (req,res) => {

  res.render('login');

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
  if (checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword) !== false){

    let user_id_cookie_value = checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword);
    //store user ID cookie  
    res.cookie('user_id', user_id_cookie_value)

    //redirect to /urls -- looks like something needs to be passed here so that 
    //the logic in the header partial gets activated when
    res.redirect('/urls')

  } else {

    res.send ('403 Forbidden: Username or password is incorrect.')

  }

});

//route #9 - logout route
app.post('/logout', (req,res) =>{


  // res.cookie('username','')
  res.clearCookie('user_id')

  // // //
  // res.redirect('/urls')

  // res.cookie('username', '' )

  res.redirect('/urls')

})

// ROUTE #1
// /urls - route page that displays all short URL and Long URLs in our urlDatabase. - VERIFIED 
app.get('/urls', (req,res) => {
  
  // console.log(req.cookies.username) //returns username from cookie

  //templateVars gets sent to es6 as an object.. 
  // //what it should be: 
  // const templateVars = {username: myAppUsers[req.cookies.user_id], urls: urlDatabase};
  // console.log(myAppUsers[req.cookies.user_id])
  // testting username from cookies
  const templateVars = 
  {user: myAppUsers[req.cookies.user_id],
    urls: urlDatabase
  };
  

  //templateVars - used to send data to front end
  //respond by rendering.. parameter 1 is the view we want to look at and template vars is the database object.. would probably be a link to some server/external db..

  //console.log(templateVars)
  //console.log(myAppUsers)

  res.render("urls_index", templateVars);

}); 

// ROUTE #2
//GET route to render the urls_new.ejs template.
// /urls/new route needs to be defined before the GET /urls/:id r
app.get("/urls/new", (req, res) => {

  cookiesObject = req.cookies

  if (Object.keys(cookiesObject).length === 0){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login')
    
  } else {

    const templateVars = {user: myAppUsers[req.cookies.user_id]}

    res.render("urls_new", templateVars);

  }


});

//ROUTE for this post matches route #1...
//POST route to handle the submission.
//route #2 & #3 are separate routes... note that we alread have defined a app.ger for route #3 (route #1)

//route#2's ejs template (urls_new) contains a form object which upon submission invokes route#3..
 
//ROUTE 3 // this is what gets executed after user submits url to be shortened// 
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //req.body needs to be added as a value to our URL DB
  //declare and generate new key/tinyURL;

  let newKeyAKAShortURL = generateRandomString();
  //req.body.longURL; what the user enters in the submission box
  
  //original
  //urlDatabase[(newKeyAKAShortURL)] = req.body.longURL;

  //updated to now store the long URL and userID that generated it.. 
  urlDatabase[(newKeyAKAShortURL)] = {longURL: req.body.longURL, userID : req.cookies.user_id }


  //is this the location response header??
  //redirect sends this to route #3
  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});


//ROUTE #4
//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  
  const templateVars = { user: myAppUsers[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  
  if (urlDatabase[req.params.shortURL]){

    res.render("urls_show", templateVars);


  } else {

    res.send('The url Does not exist');

  }

});



//inputEmail = req.body.email when checkForExistingEmail is called in the route.. 
//userDatabse = myAppUsers when checkForExistingEmail is called in the route.. 
//generatedUserId


//ROUTE #5
//add route to redirect to to website given a shortURL discriptor in the url
app.get("/u/:shortURL", (req, res) => {

  //need to fix this part since the structure of urlDatabase has changed//


  const templateVars = {user: myAppUsers[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
 
  if (urlDatabase[req.params.shortURL]){

  //use shortURL to provide long url...
  res.redirect(templateVars.longURL);
 

  } else {

    res.send('The url Does not exist');

  }

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


