const http = require('http');
const express = require('express');
var mysql = require('mysql');

var movieController = require('./controllers/movieController');
var listingController = require('./controllers/listingController');
var rankingController = require('./controllers/rankingController');

const config = require('./config.json');

var app = express();

//Set up EJS
app.set('view engine', 'ejs');

//Initialize DB Connection
var con = mysql.createConnection({
  host: config.database.host,
  user: config.database.username,
  password: config.database.password,
  database: config.database.database
});

//Set up static files
app.use('/public', express.static('public'));

movieController(app, con);
listingController(app, con);
rankingController(app, con);

//Listen to Port
app.listen(config.app.port);
console.log("Port " + config.app.port + " Initialized");
