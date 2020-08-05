const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "potato@gmail.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser())


//
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
 

//Renders INDEX FILE
app.get("/urls", (req, res) => {
  // console.log('Cookie Request -->',req.cookies)
  let templateVars = {
    username: req.cookies["user_id"],
    urls: urlDatabase
  };

  // console.log('Cookie Request ON INDEX-->',JSON.stringify(templateVars));
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["user_id"],
    urls: urlDatabase
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"],
    urls: urlDatabase
    };
  
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURLWebSite = urlDatabase[req.params.shortURL];
  res.redirect(longURLWebSite);
});

//REGISTER form request 
app.get("/register", (req, res) => {
  // console.log('Cookie Request -->',req.cookies)
  let templateVars = {
    username: req.cookies,
    urls: urlDatabase
  };

  // console.log('Cookie Request REGISTER -->',templateVars)
  res.render("register", templateVars);
});

//POST request creates a short URL
app.post("/urls", (req, res) => {
  console.log(`${req.body}`);
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  
  urlDatabase[shortURL] = longURL;
  
  console.log(`Created ShortURL --> ${shortURL} for ${req.body.longURL}`);  // Log the POST request body to the console

  res.redirect(`/urls/${shortURL}`);        
  
});

//POST request for delete button
app.post("/urls/:shortURL/delete", (req, res) => {

  console.log(`Deleted ShortURL --> ${req.params.shortURL}`);

  delete urlDatabase[req.params.shortURL];


  res.redirect(`/urls`);
  
});

//POST request for Edit button
app.post("/urls/:shortURL/edit", (req, res) => {

  let shortURL = req.params.shortURL;

  console.log(`To Edit ShortURL --> ${shortURL}`);
  
  res.redirect(`/urls/${shortURL}`);
  
});

//POST request for submit EDIT button
app.post("/urls/:shortURL/submit", (req, res) => {

  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  console.log(`Edited ShortURL --> ${shortURL} to ${req.body.longURL}`);

  res.redirect(`/urls/${shortURL}`); 
});

//POST request for Login submit button
app.post("/login", (req,res) => {
  console.log(req.body);
  let { user_id } = req.body;

  console.log(`Username is --> ${user_id}`);

  res.redirect('/urls');
});


//LOGOUT
app.post("/logout", (req,res) => {

  console.log(`Delete username cookie --> ${JSON.stringify(req.cookies["user_id"])}`);

  res.clearCookie('user_id');

  res.redirect('/urls');
});

//Register
app.post("/register", (req, res) => {

  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  if (email === '' || password === ''){
    res.status(400).send('fields cannot be left blank! STATUS CODE 400');
  }
  
  emailInUsers(users, email, () => {
    res.status(400).send('Email already in use! STATUS CODE 400');
  })

  users[id] = {
    id,
    email,
    password
  };
  console.log(users);
  res.cookie('user_id', users[id]);

  // console.log('EMAIL -->', email, 'PASS -->', password);
  // console.log('USERS -->', users);

  res.redirect(`/urls`);        
});

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
};

function emailInUsers(usersObj, refEmail, callback) {
  for (let i in usersObj){
    if (usersObj[i].email === refEmail) {
      callback();
    }
  };
};