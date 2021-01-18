const express = require("express");

//initialize our app server
const app = express ();

//default port to listen to.
const PORT = 8080;

//using ejs as our apps templating engine
app.set("view engine", "ejs");


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

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //pass templateVars to ejs  
  res.render("urls_show", templateVars);

});