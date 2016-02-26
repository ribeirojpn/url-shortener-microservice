'use strict';
var http = require('http');
var app = require('express')();
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/url-shortener');
var URL = process.env.APP_URL ||'http://localhost:3000/';

// mongodb schema
var urlSchema = mongoose.Schema({
    original_url: String,
    short_url: String
});

var Url = mongoose.model('url', urlSchema);

// express configs
app.set('views','./views');
app.set('view engine','ejs');

// express routes
app.get('/',function(req,res) {
  res.render('index');
});

app.get('/new/:url*',function(req,res) {
  var paramUrl = req.url.slice(5);
  if (validate(paramUrl)){
    var result = {};
    Url.findOne({original_url: paramUrl}).select({original_url:1, short_url:1,_id:0}).exec().then(function(url) {
      if (url){
        res.json(url);
      } else {
        var newUrl = {};
        newUrl.short_url = URL + getRandomUrl();
        newUrl.original_url = paramUrl;
        var urlContent = new Url(newUrl);
        urlContent.save(function (err,url) {
          if (err) return console.error(err);
          result.original_url = newUrl.original_url;
          result.short_url = newUrl.short_url;
          res.json(result);
        });
      }

    },function (erro) {
      console.error(err);
    });

  } else if(req.query.allow == 'true'){
    var result = {}
    result.original_url = 'invalid';
    result.short_url = URL + 'zZzZzZz';

    res.send(result);
  } else {
    res.send({"error":"URL invalid"});
  }
});

app.get('/:id',function(req,res) {
  Url.findOne({short_url: URL + req.params.id},function(err,url) {
    if (url){
      res.redirect(url.original_url);
    } else {
      res.send({"error":"URL invalid"});
    }
  });
});

http.createServer(app).listen(process.env.PORT || 3000, function() {
  console.log('Server on...');
});


function validate(url){
  // regex from @diegoperini in https://gist.github.com/dperini/729294
  var regex =  /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return regex.test(url);
}

// mongodb connection check
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected in mongoDB with mongoose');
});

// Generate random url
function getRandomUrl(){
  var url = "";
  var VALUES = "ABCDEFabcdef0123456789";

  for (var i=0; i < 4; i++){
    url += VALUES.charAt(Math.floor(Math.random() * VALUES.length));
  }

  return url;
}
