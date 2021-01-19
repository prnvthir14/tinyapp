const express = require("express");

//initialize our app server
const app = express ();

//default port to listen to.
const PORT = 8080;

//using ejs as our apps templating engine
app.set("view engine", "ejs");

//
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// test data to work with
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


//get to <domianName>/urls.json; display json(urlDatabase)
//test to check server ius running: 
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});



//new route handlers to incorporate ejs view engine;

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
//this is a separate route from route#2
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //req.body needs to be added as a value to our URL DB
  //declare and generate new key/tinyURL;

  let newKeyAKAShortURL = generateRandomString();
  //req.body.longURL; what the user enters in the submission box
  
  urlDatabase[(newKeyAKAShortURL)] = req.body.longURL;
  
  //console.log(urlDatabase)
  //ok, checked that the urlDatabse has b
  //res.send('ok');         // Respond with 'Ok' (we will replace this)
  ///everything works till here.. now trying redirect... 


  //is this the location response header??
  //redirect sends this to route #3
  res.redirect(`/urls/${newKeyAKAShortURL}`);
  
});

//our express server so that the shortURL-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls

//ROUTE #3
//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //pass templateVars to ejs  
  res.render("urls_show", templateVars);

});


//ROUTE #4
//add route to redirect to to website given a shortURL discriptor in the url
app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //use shortURL to provide long url...
  res.redirect(templateVars.longURL);

});


// //need to fix the ejs files I think... should all the links go to something?
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?