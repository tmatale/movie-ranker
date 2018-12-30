module.exports = function Movie(id, title, year) {
  this.id = id;
  this.title = title;
  //this.rating = rating;
  this.year = year;
  this.genres = [];
  this.description = "";
  this.poster = "/no_poster.jpg";
  this.rank = 0;

  this.setRank = function(r){
    this.rank = r;
  }

  this.setYear = function(y){
    this.year = y;
  }

  this.setDescription = function(d){
    this.description = d;
  };

  this.setGenres = function(g){
    this.genres = g.slice(0);
  }

  this.setPosterPath = function(p){
    this.poster = p;
  }

};

