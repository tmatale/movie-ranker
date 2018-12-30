
var Movie = require('../classes/Movie');

//var bodyParser = require('body-parser');
//var urlencodedParser = bodyParser.urlencoded({extended: false});

//var request = require('request');
//var fs = require('fs');

module.exports = function(app, con){

  //app.use(bodyParser.urlencoded({ extended: false }));
  //app.use(bodyParser.json());

  app.get("/listings",function(req, res){

    var movies = new Array();

    con.query("SELECT COUNT(*) as 'count' FROM movie", [], function (err, result){
      
      var total_movies = result[0].count;
      
      //This corresponds to the 95% confidence level
      var zscore = 1.96;
      
      //We care to within 10%
      var moe = 0.1;
      
      //I guess 0.5 for this as a starting point? Maybe change later
      var std_dev = 0.5;
      
      //Now that we have all the variables we can get the required sample size using a simple
      //formula
      var sample_size = (((Math.pow(zscore,2))*(std_dev)*(1-std_dev))/(Math.pow(moe,2)))/(1+(((Math.pow(zscore,2))*(std_dev)*(1-std_dev))/((Math.pow(moe,2))*total_movies)));

      
      con.query("SELECT b.id, b.title, b.year FROM rank a JOIN movie b ON b.id = a.movie_id WHERE a.user_id IN (?) AND (a.wins + a.losses) > ? ORDER BY a.percentage DESC", [1, sample_size], function (err, result) {
        if (err) throw err;
        for(var i = 0; i < result.length; i++){
          movies.push(new Movie(result[i].id, result[i].title, result[i].year));
        }

        res.render('listings', {movies: movies});
      });
    });
  });

}
 
