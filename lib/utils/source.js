// author: jmarroyave
"use strict";

const console = require("./console");

function get( input, options={} ){
  const { verbose=false } = options
  const validator = require("./validator");
  const resp = { type: null, value: input }

  if(!input) throw new Error("no input provided")

  if( validator.isURL(input) ){
    resp.type = "URL"
  } else if( validator.isDNS(input) ){
    resp.type = "DOMAIN"
  } else if( validator.isLocalFile(input) ){
    resp.type = "FILE"
  } else {
    throw new Error("unknown input")
  }

  if(verbose) console.breadcrumbs.print("getSource", "from" , resp.type)

  return resp
}


module.exports = {
  get: get,
};