const bcrypt = require('bcrypt');

//HELPER FUNCTIONS --------------------------------------------------------------------
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

function emailInUsers(usersObj, refEmail) {
  for (let user in usersObj) {
    if (usersObj[user].email === refEmail) {
      return user;
    }
  }
  return false;
}

function shortURLinUsers(usersObj, refShortURL) {
  for (let i in usersObj) {
    if (i === refShortURL) {
      return true;
    }
  }
  return false;
}


// function authenticateUser(usersObj, refEmail, refPassword){
//   for (let i in usersObj){
//     if (usersObj[i].email === refEmail) {
//       if(bcrypt.compareSync(refPassword, usersObj[i].password)) {
//           return i;
//         }
//      }
//    }
//   return false;
// };


function authenticateUser(usersObj, refEmail, refPassword) {

  let user = emailInUsers(usersObj, refEmail);
  
  if (user) {
    if (bcrypt.compareSync(refPassword, usersObj[user].password)) {
      return user;
    }
  }

  return false;
}

function urlsForUser(usersObj, id) {
  let tempObj = {};
  
  for (let i in usersObj) {
    if (usersObj[i].userID === id) {
    
      tempObj[i] = usersObj[i];
      
    }
  }
  console.log(tempObj);
  return tempObj;
}

module.exports = {
  generateRandomString,
  emailInUsers,
  shortURLinUsers,
  authenticateUser,
  urlsForUser
};