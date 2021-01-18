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

//get to <domianName>/urls.json; display json(urlDatabase)
app.get("/urls.json", (req,res) => {

  res.json(urlDatabase);

})


//get to <domianName>/urls.json; display json(urlDatabase)
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

//new route handles to incorporate ejs view engine;
app.get('/urls', (req,res) => {

  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);

}); 