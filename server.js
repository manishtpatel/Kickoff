// for development only

var express = require('express');
var app = express();

app.use(express.static('./'));

app.listen(3000);

console.log('http://localhost:3000')
