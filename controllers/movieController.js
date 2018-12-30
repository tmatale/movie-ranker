var Movie = require('../classes/Movie');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});

var request = require('request');
var fs = require('fs');

module.exports = function(app, con){

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/movie/add",function(req, res){
    res.render('add-movie');
  });

  app.post("/movie/add",function(req, res){

    con.query("INSERT INTO movie (title, year) VALUES (?, ?)", [req.body.title, req.body.year], function (err, result) {
      if (err) throw err;
      res.send("movie added");
    });

  });

  app.get("/movie/link", function(req, res){

    var movies = new Array();

    con.query("SELECT a.id, a.title, a.year FROM movie a WHERE a.id NOT IN (SELECT b.movie_id FROM rank b WHERE b.user_id IN (?)) ORDER BY a.title ASC, a.YEAR ASC", [1], function(err, result) {
      if (err) throw err;
      for(var i = 0; i < result.length; i++){
        movies.push(new Movie(result[i].id, result[i].title, result[i].year));
      }

      res.render('movies', {movies: movies});
    });
  });

  app.get("/movie/link/:id", function(req, res){

    //Check if this is a valid movie id
    con.query("SELECT a.id, a.title, a.year FROM movie a WHERE a.id IN (?) LIMIT 1", [req.params.id], function(err, result) {
      if (err) throw err;
      
      if(result.length > 0){

        var movie = new Movie(result[0].id, result[0].title, result[0].year);

        //Next check if this is already attached to the user
        con.query("SELECT COUNT(*) AS 'count' FROM rank a WHERE a.user_id IN (?) AND a.movie_id IN (?)", [1, req.params.id], function(err, result) {
          if (err) throw err;
          
          if(result[0].count == 0){

            //Now that everything is alright, we can add the movie to this user
            //with a score of 0
            con.query("INSERT INTO rank (movie_id, user_id, wins, losses, percentage) VALUES (?, ?, 0, 0, 0)", [req.params.id, 1], function(err, result) {
              res.send("movie added to user ranking");
            });
          }
        });
      }
    });
  });
}
