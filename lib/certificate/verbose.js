// author: jmarroyave
"use strict";

const subject = ( cert ) => {
  var obj = null;
  var props = ["CN", "O", "OU"]

  for(const prop of props){
    if(cert.subject[prop]) {
      obj = prop  
      break;
    }
  }

  return (obj) ? cert.subject[obj].slice(0,20) : "???"
}

module.exports = {
  subject: subject,
};
