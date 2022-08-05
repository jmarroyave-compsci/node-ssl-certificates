// author: jmarroyave
"use strict";

console.width = process.stdout.columns ?? 80

class Breadcrumbs{
    constructor(){
        this.stack = []
    }

    print(){
        var args = argsToArray(arguments);
        args.forEach( item => this.stack.push(item) )
        this._print()
        args.forEach( item => this.stack.pop(item) )
    }

    push(){
        var args = argsToArray(arguments);
        args.forEach( item => this.stack.push(item) )        
    }

    pop(){
        this.stack.pop()
    }

    _print(){
        const output = []
        this.stack.forEach( p => output.push(p))
        console.title.apply(console, output)
    }
}

console.breadcrumbs = new Breadcrumbs()

console.title = function () {
    var args = argsToArray(arguments);
    var msg = args.join(" | ").toUpperCase()
    console.log(" >", msg);
}

console.line = function (char=null) {
    char = char ?? "─"
    const slevel = 0
    if(slevel != "")
        console.log(slevel, char.repeat(process.stdout.columns - slevel.length - 1));
    else
        console.log(char.repeat(process.stdout.columns));
}


const argsToArray = function (args) {
    if (Array.isArray(args)) return args;

    var keys = Object.keys(args);
    var ret = [];
    for (var i = 0; i < keys.length; i++) {
        ret.push(args[keys[i]]);
    }

    return ret;
}

module.exports = console