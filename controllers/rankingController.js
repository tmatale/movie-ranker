
var Movie = require('../classes/Movie');

//var bodyParser = require('body-parser');
//var urlencodedParser = bodyParser.urlencoded({extended: false});

//var request = require('request');
//var fs = require('fs');

module.exports = function(app, con){

  //app.use(bodyParser.urlencoded({ extended: false }));
  //app.use(bodyParser.json());

  app.get("/compare",function(req, res){

    var movies = new Array();

    //First we select the least compared movie
    con.query("SELECT a.id, a.title, a.year FROM movie a LEFT JOIN rank b ON a.id = b.movie_id AND user_id IN (?) ORDER BY (b.wins + b.losses) ASC, RAND() LIMIT 1", [1], function (err, result) {
      if (err) throw err;
      
      if(result.length > 0){
        movies.push(new Movie(result[0].id, result[0].title, result[0].year));
        movies[0].setRank(result[0].place);
      }

      //Next we want to compare it to a movie that is hasn't been compared to before so we search the list
      //for one and then pick a random one from the list
      con.query("SELECT id, title, year FROM movie WHERE id NOT IN (?) AND id NOT IN (SELECT movie_1 FROM comparison WHERE movie_0 IN (?) AND user_id IN (?)) ORDER BY RAND() LIMIT 1", [movies[0].id, movies[0].id, 1], function(err, result){
        if (err) throw err;
        
        if(result.length > 0){
          movies.push(new Movie(result[0].id, result[0].title, result[0].year));
          res.render('compare', {movies: movies});
        }
        else{
          res.render('compare', {movies: []});
        }
      });


      //res.render('compare', {movies: movies});
    });
  });

  app.post("/compare", function(req, res){

    //Get the movie and the new rank
    var s_movie_id = eval("req.body.movie_" + req.body.compare);
    var u_movie_id = eval("req.body.movie_" + (1 - req.body.compare));
    
    var perms = [
      [s_movie_id, u_movie_id, 1],
      [u_movie_id, s_movie_id, 0],
    ];
    
    perms.forEach(function(e){

      //Update the comparisons with the correct results
      con.query("INSERT INTO comparison (user_id, movie_0, movie_1, result) VALUES (?, ?, ?, ?)", [1, e[0], e[1], e[2]], function(err, result) {
        if (err) throw err;
        
        //Next get the number of wins and losses for the first slotted movie
        con.query("SELECT a.wins, a.losses FROM rank_history a WHERE a.movie_id IN (?) AND a.user_id IN (?) ORDER BY created DESC LIMIT 1", [e[0], 1], function(err, result) {
          if (err) throw err;          
          
          //Default wins and losses to 0
          var wins = losses = 0;
          var in_table = false;
          
          //Get the wins and losses if they exist
          if(result.length > 0){
            wins = result[0].wins;
            losses = result[0].losses;
            in_table = true;
          }
          
          //Correct them accordingly
          wins += e[2];
          losses += (1 - e[2]);
          
          var percentage = wins / (wins + losses);
          
          //Then store the new results asynchronous in both the rank and rank history
          con.query("INSERT INTO rank_history (user_id, movie_id, wins, losses, percentage) VALUES (?, ?, ?, ?, ?)", [1, e[0], wins, losses, percentage.toFixed(3)], function(err, result) {
            if (err) throw err;
          });
          
          if(in_table){
            con.query("UPDATE rank SET wins = ?, losses = ?, percentage = ? WHERE user_id IN (?) AND movie_id IN (?)", [wins, losses, percentage.toFixed(3), 1, e[0]], function(err, result) {
              if (err) throw err;
            });
          }
          else{
            con.query("INSERT INTO rank (user_id, movie_id, wins, losses, percentage) VALUES (?, ?, ?, ?, ?)", [1, e[0], wins, losses, percentage.toFixed(3)], function(err, result) {
              if (err) throw err;
            });
          }
          
        });
      });
    });
    
    res.redirect('/compare');
    res.end();
    
  });
}
