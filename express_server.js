const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

//Import Helper Functions
const {
  generateRandomString,
  emailInUsers,
  shortURLinUsers,
  authenticateUser,
  urlsForUser
} = require("./helpers");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


//Databases
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL: "http://www.google.com"}
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
};




//--------------------------------------------------------------------------------------------
//-------------------------------- GET REQUESTS ----------------------------------------------
//--------------------------------------------------------------------------------------------

app.get("/", (req, res) => {

  if (!req.session.user_id) {
    res.redirect("/login");
  }
  
  res.redirect("/urls");

});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//JSON OBJECT -------------------------- RENDER ----------------------------------------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
 

//INDEX -------------------------------- RENDER ----------------------------------------------
app.get("/urls", (req, res) => {
  
  if (req.session.user_id) {
    let data = urlsForUser(urlDatabase ,req.session.user_id.id);
    
    let templateVars = {
      username: req.session.user_id,
      urls: data
    };
    // console.log('Cookie Request ON INDEX-->',JSON.stringify(templateVars));
    res.render("urls_index", templateVars);
  } else {
    
    let templateVars = {
      username: null,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  }
});


//CREATE NEW URL ----------------------- RENDER ----------------------------------------------
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  };

  if (!req.session.user_id) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});



//SHORTURL ----------------------------- RENDER ----------------------------------------------
app.get("/urls/:shortURL", (req, res) => {

  let shortURLCheck = req.params.shortURL;

  if (!req.session.user_id) {
    
    res.sendStatus(403);
    
  } else if (!urlDatabase[shortURLCheck]) {

    res.sendStatus(400);    

  } else {

    let shortURL = req.params.shortURL;
    let loggedUserURLS = urlsForUser(urlDatabase,req.session.user_id.id);
    let flag = false;

    if (shortURLinUsers(loggedUserURLS, shortURL)) {
      flag = true;
    }

    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: req.session.user_id,
      urls: urlDatabase,
      flag: flag
    };
    
    res.render("urls_show", templateVars);
  }
});


//SHORT FORM URL -------------------------
app.get("/u/:shortURL", (req, res) => {
  
  const longURLWebSite = urlDatabase[req.params.shortURL].longURL;
  
  res.redirect(`${longURLWebSite}`);
});



//REGISTER ----------------------------- RENDER ----------------------------------------------
app.get("/register", (req, res) => {
  
  if (!req.session.user_id) {
    
    let templateVars = {
      username: null,
      urls: urlDatabase
    };
  
    res.render("register", templateVars);

  } else {

    let templateVars = {
      username: req.session,
      urls: urlDatabase
    };
    
    res.render("register", templateVars);
  }
});


//LOGIN -------------------------------- RENDER ----------------------------------------------
app.get("/login", (req, res) => {

  if (!req.session.user_id) {
    
    let templateVars = {
      username: null,
      urls: urlDatabase
    };
  
    res.render("login", templateVars);

  } else {

    let templateVars = {
      username: req.session,
      urls: urlDatabase
    };

    res.render("login", templateVars);
  }
});



//--------------------------------------------------------------------------------------------
//------------------------------  POST REQUESTS ----------------------------------------------
//--------------------------------------------------------------------------------------------


//CREATE SHORTURL ----------------------------------------------------------------------------
app.post("/urls", (req, res) => {
  
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let userID = req.session.user_id.id;
  
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  
  res.redirect(`/urls/${shortURL}`);
  
});

//DELETE SHORTURL -----------------------------------------------------------------------------
app.post("/urls/:shortURL/delete", (req, res) => {

  if (!req.session.user_id) {
    res.redirect("/login");
  }

  let shortURL = req.params.shortURL;
  let loggedUserURLS = urlsForUser(urlDatabase,req.session.user_id.id);

  if (shortURLinUsers(loggedUserURLS, shortURL)) {
    
    console.log(`Deleted ShortURL --> ${req.params.shortURL}`);
  
    delete urlDatabase[req.params.shortURL];
  }
  
  res.redirect(`/urls`);
});

//EDIT SHORTURL -- REDIRECT --------------------------------------------------------------------
app.post("/urls/:shortURL/edit", (req, res) => {

  let shortURL = req.params.shortURL;

  res.redirect(`/urls/${shortURL}`);
  
});

//EDIT SHORTURL -- COMMIT ----------------------------------------------------------------------
app.post("/urls/:shortURL/submit", (req, res) => {
  
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  let userID = req.session.user_id.id;

  let loggedUserURLS = urlsForUser(urlDatabase, req.session.user_id.id);

  if (shortURLinUsers(loggedUserURLS, shortURL)) {
    
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
  
    console.log(`Edited ShortURL --> ${shortURL} to ${JSON.stringify(urlDatabase[shortURL])}`);
  }
  
  res.redirect(`/urls/${shortURL}`);
});


//LOGIN ---------------------------------------------------------------------------------------
app.post("/login", (req,res) => {

  let email = req.body.email;
  let password = req.body.password;
  
  if (email === '' || password === '') {
    res.sendStatus(400);
  }

  if (authenticateUser(users, email, password)) {
    
    let userIndex = authenticateUser(users, email, password);
    
    req.session.user_id = users[userIndex];
    
    console.log(users[userIndex]);
  
  } else {
    res.sendStatus(403);
  }

  res.redirect('/urls');
});


//LOGOUT ---------------------------------------------------------------------------------------
app.post("/logout", (req,res) => {

  console.log(`Delete username cookie --> ${JSON.stringify(req.session.user_id)}`);

  // res.clearCookie('user_id');
  req.session = null;

  res.redirect('/urls');
});

//REGISTER -------------------------------------------------------------------------------------
app.post("/register", (req, res) => {

  let id = generateRandomString();
  
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password,10);

  if (email === '' || password === '') {
    res.sendStatus(400);
  }

  if (emailInUsers(users, email)) {
    res.sendStatus(400);
  }

  users[id] = {
    id,
    email,
    password
  };
  
  req.session.user_id = users[id];
  
  res.redirect(`/urls`);
});





