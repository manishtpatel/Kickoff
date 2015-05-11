// for development only

var express = require('express');
var app = express();

// global controller
app.get('/*',function(req,res,next){
    res.header('Access-Control-Allow-Origin' , 'http://localhost:3000' );
    next(); // http://expressjs.com/guide.html#passing-route control
});

app.use(express.static('./'));

app.listen(3000);

console.log('http://localhost:3000')
