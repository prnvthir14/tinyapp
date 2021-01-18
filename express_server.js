const express = require("express");

//initialize our app server
const app = express ()

//default port to listen to.
const PORT = 8080;

// test data to work with
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//if method is get and path = root
app.get('/', (req,res) => {

  res.send('Hello');

});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});