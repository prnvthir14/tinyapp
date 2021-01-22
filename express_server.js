const express = require("express");

//initialize our app server
const app = express ();

//default port to listen to.
const PORT = 8080;

//using ejs as our apps templating engine
app.set("view engine", "ejs");

//cookieparse - takes in string and outputs object for incoming data...
// var cookieParser = require('cookie-parser')
// app.use(cookieParser())
//now using cookieSession
const cookieSession = require('cookie-session')

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

//
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');


// // test data to work with
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  "b2xVn2": {longURL : "http://www.lighthouselabs.ca", userID: '12345'},
  "b2xVaz": {longURL : "http://www.skypsports.com", userID: '12345'},
  "b2xVqq": {longURL : "http://www.espncricinfo.com", userID: '12345'},
  "9sm5xK": {longURL : "http://www.google.com", userID: '56847'}
};


//empty object to store user data on registration
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
  }
}

////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////
// function to check attempted login credientials against database
const checkLoginDetails = (attemptedLoginEmail, attemptedLoginPassword) => {  

  for (let users in myAppUsers){
      
    //gets us access to all users
    //console.log(myAppUsers[users].email)
    //  console.log(myAppUsers[users].password)
     if (attemptedLoginEmail === myAppUsers[users].email){
      //works for true case console.log('imhere')
      if (bcrypt.compareSync(attemptedLoginPassword,(myAppUsers[users].password)) ){
        //if true and login is successful, return the suer_ud to store in cookie//
        return myAppUsers[users].id
                
      }

    }
    
  } 
  return false; 

}

// function that will compare userId stored in cookie with userID in urlDatabase.. to be called in /urls get route
//////////////////////////////////////////////////////////////////////////
const returnURLsForThisUser = (UserIDFromCookie) => {

  //empty object to store required kvps from urlDatabase
  let urlDatabasePerUser = {};

  for (let key in urlDatabase) { 
   
    if (UserIDFromCookie === urlDatabase[key].userID){
    
      urlDatabasePerUser[key] = urlDatabase[key];

    }
  } 
  return urlDatabasePerUser;
}

//////////////////////////////////////////////////////////////////////////
const checkShortURL = (urlsForUserID, shortURL, UserIDFromCookie) =>{

  //get access to all shortURls (keys pf urlDatabase)
  for (let key in urlsForUserID){
    //req.params comes as an array, so comparing 1st element with key  
    if (shortURL[0] === key){
      //user.id comes from cookie
      //if 1s condition passes, does userid from cookie match userid for shorturl/key in  urlsForUserID
      if(UserIDFromCookie === urlsForUserID[key].userID){
        //if both conditions pass, return true and let route contiue
        return true;
      
      }

    } 
    //if we fail either condition (invalid shortURL or user did not create this URL) then we 
    return false

  } 

}
//////////////////////////////////////////////////////////////////////////

//route 0 to home page.. if userId cookies present, go to /urls else redirect to login page
app.get('/', (req,res) => {

  cookiesObject = req.session;

  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login')
    
  } else {

    const templateVars = {user: myAppUsers[req.session.user_id]}

    res.redirect("/urls");

  }    
  
})



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
  let userEnteredPasswordHashed = bcrypt.hashSync(userEnteredPassword, 10)

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
      'email' : userEnteredEmail,
      'password' : userEnteredPasswordHashed
    }
  
  
    //set cookie to remember userID
    //res.cookie('user_id', userId )
    req.session.user_id = userId; 
  
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

    let userId = checkLoginDetails(attemptedLoginEmail, attemptedLoginPassword);
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
  
  // console.log(req.cookies.username) //returns username from cookie

  //templateVars gets sent to es6 as an object.. 
  // //what it should be: 
  // const templateVars = {username: myAppUsers[req.cookies.user_id], urls: urlDatabase};
  // console.log(myAppUsers[req.cookies.user_id])
  // testting username from cookies
  // const templateVars = 
  // {user: myAppUsers[req.cookies.user_id],
  //   urls: urlDatabase
  // };
  

  //templateVars - used to send data to front end
  //respond by rendering.. parameter 1 is the view we want to look at and template vars is the database object.. would probably be a link to some server/external db..

  //console.log(templateVars)
  //console.log(myAppUsers)

  // res.render("urls_index", templateVars);

  ////////////////////heavy changes due to permissions requirements
  // check if the user us logged in or not

  cookiesObject = req.session;
  // console.log(Object.keys(cookiesObject).length)
  if (Object.keys(cookiesObject).length === 1){
    //if someone is not logged in (no cookies exists when accessing /urls/new then redirect to login)  

    res.redirect ('/login')
    
  } else {

    //call function to return only urls for that user.. 
    let urlsToPass = returnURLsForThisUser(req.session.user_id);


    const templateVars = 
    {user: myAppUsers[req.session.user_id],
      urls: urlsToPass
    };
    //console.log(myAppUsers)  
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

  let newKeyAKAShortURL = generateRandomString();
  //req.body.longURL; what the user enters in the submission box
  
  //original
  //urlDatabase[(newKeyAKAShortURL)] = req.body.longURL;

  //updated to now store the long URL and userID that generated it.. 
  urlDatabase[(newKeyAKAShortURL)] = {longURL: req.body.longURL, userID : req.session.user_id }


  //is this the location response header??
  //redirect sends this to route #3
  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});

////
//need to commit - changes to route 4 + helper fns

//ROUTE #4
//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  cookiesObject = req.session;

  let urlsForUserID = returnURLsForThisUser(cookiesObject.user_id) 
  //console.log(urlsForUserID)
  let user = myAppUsers[cookiesObject.user_id];//{ id: '12345', email: 'user@example.com', password: 'purple' }

 
  let userIDFromCookie = cookiesObject.user_id
  
  let shortURL = req.params.shortURL; //:id from url i.e. [ 'b2xVn2' ]
  let longURL = urlsForUserID[shortURL]['longURL']; //long url


  //if not logged in, redirect to login.
  if (Object.keys(cookiesObject).length === 1){

    res. redirect('/login');
    
  } else {
    //if logged in:
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


