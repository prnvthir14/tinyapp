const express = require("express");

//initialize our app server
const app = express ();

//default port to listen to.
const PORT = 8080;

//using ejs as our apps templating engine
app.set("view engine", "ejs");

//
const bodyParser = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({extended: true}));

// test data to work with
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const generateCurrentShortURL = function (urlDatabase){

  let currentShortUrl = [];

  for (let shortURL in urlDatabase){

    currentShortUrl.push(shortURL);
  
  }

  return currentShortUrl

}

let listOfCurrentShortURL = generateCurrentShortURL(urlDatabase)

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


// ROUTE #1
// /urls - route page that displays all short URL and Long URLs in our urlDatabase. - VERIFIED 
app.get('/urls', (req,res) => {

  //templateVars gets sent to es6 as an object.. 
  const templateVars = { urls: urlDatabase };
  //templateVars - used to send data to front end
  //respond by rendering 
  res.render("urls_index", templateVars);

}); 

// ROUTE #2
//GET route to render the urls_new.ejs template.
// /urls/new route needs to be defined before the GET /urls/:id r
app.get("/urls/new", (req, res) => {

  res.render("urls_new");

});

//ROUTE for this post matches route #1...
//POST route to handle the submission.
//route #2 & #3 are separate routes... note that we alread have defined a app.ger for route #3 (route #1)

//route#2's ejs template (urls_new) contains a form object which upon submission invokes route#3..
 
//ROUTE 3
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //req.body needs to be added as a value to our URL DB
  //declare and generate new key/tinyURL;

  let newKeyAKAShortURL = generateRandomString();
  //req.body.longURL; what the user enters in the submission box
  
  urlDatabase[(newKeyAKAShortURL)] = req.body.longURL;

  //is this the location response header??
  //redirect sends this to route #3
  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});

//our express server so that the shortURL-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls

//function to check if a shortURL entered by the user matches anything currentl in the database.. 

const checkForURL = (listOfCurrentShortURL, shortURLFromUser) => {

  if ((listOfCurrentShortURL.includes(shortURLFromUser))){

    return true;

  } else {

    return false;

  }

}


//ROUTE #4
//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  
  if (urlDatabase[req.params.shortURL]){

    res.render("urls_show", templateVars);


  } else {

    res.send('The url Does not exist');

  }

});


//ROUTE #5
//add route to redirect to to website given a shortURL discriptor in the url
app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
 
  if (urlDatabase[req.params.shortURL]){

  //use shortURL to provide long url...
  res.redirect(templateVars.longURL);
 

  } else {

    res.send('The url Does not exist');

  }

});


// //need to fix the ejs files I think... should all the links go to something?
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?