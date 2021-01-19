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


//if method is get and path = root
app.get('/', (req,res) => {

  res.send('Hello');

});

//get to <domianName>/urls.json; display json(urlDatabase)  - this is not longer needed since we are using ejs now (new get on line 46)
// app.get("/urls.json", (req,res) => {

//   res.json(urlDatabase);

// })

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
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});



//new route handlers to incorporate ejs view engine;
app.get('/urls', (req,res) => {

  //templateVars gets sent to es6 as an object.. 
  const templateVars = { urls: urlDatabase };
  //templateVars - used to send data to front end
  //respond by rendering 
  res.render("urls_index", templateVars);

}); 


//GET route to render the urls_new.ejs template.
// /urls/new route needs to be defined before the GET /urls/:id r
app.get("/urls/new", (req, res) => {

  res.render("urls_new");

});

//POST route to handle the submission.
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //req.body needs to be added as a value to our URL DB
  //declare and generate new key/tinyURL;

  let newKeyAKAShortURL = generateRandomString();
  
  urlDatabase[newKeyAKAShortURL] = req.body.longURL;
  
  //console.log(urlDatabase)
  //ok, checked that the urlDatabse has b
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  
});

//our express server so that the shortURL-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls


//urls/:id render.. 
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //pass templateVars to ejs  
  res.render("urls_show", templateVars);

});

//function to generate random string


/////start hereee
// Browser renders the jtml form received:
// we have Example app listening on port 8080!
// { longURL: 'http://www.mysite1234zsad.com' }