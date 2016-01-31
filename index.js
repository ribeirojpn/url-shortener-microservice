// '/new/:url*'
var http = require('http');
var app = require('express')();
process.env.URL = 'http://localhost:3000/';
var urlContent = { "original_url": null, "short_url": null };

app.set('views','./views')
app.set('view engine','ejs');

app.get('/',function(req,res) {
  res.render('index');
});

app.get('/new/:url*',function(req,res) {
  console.log(req.query.allow);

  if (validate(req.url.slice(5))){
    urlContent.original_url = req.url.slice(5);
    // add short_url

    res.send(urlContent);
  } else if(req.query.allow == 'true'){
    urlContent.original_url = 'invalid';
    urlContent.short_url = (process.env.APP_URL || process.env.URL) + 'zZzZzZz';

    res.send(urlContent);
  } else {
    res.send({"error":"URL invalid"});
  }
  res.end();
  urlContent = { "original_url": null, "short_url": null };
});

http.createServer(app).listen(3000, function() {
  console.log('Server on...');
});


function validate(url){
  // regex from @diegoperini in https://gist.github.com/dperini/729294
  var regex =  /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return regex.test(url);
}
