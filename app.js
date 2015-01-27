var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var routes = require('./routes/index');
var users = require('./routes/users');
var Schema=mongoose.Schema;
var ObjectId = Schema.ObjectId;
var multer  = require('multer');
var fs=require('fs');
var done=false;
var http=require('http');
var auth = require('./routes/user');
var app = express();
var Token = mongoose.model('Token',mongoose.model('Token'));
var User = mongoose.model('User',mongoose.model('User'));
// --------- DB ----------
var db=mongoose.connection;
db.open('mongodb://localhost/test');
// --------- DB ----------
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/', function( req, res, next ){
  res.setHeader("Content-Type", "application/JSON");
  if( req.query.access_token ){
    debugger;
    Token.findOne( { access_token: req.query.access_token }, function( err, data ){
      if( err ){
       error.err(res,"102");
       return;
     }
     if( !data ){
      error.err(res,"619");
      return;
    }
    debugger;
    User.findOne({ _id: data.account }, function( err, data ){
      if( err ){
        error.err(res,"102");
        return;
      }
      if( !data ){
        error.err(res,"646");
        return;
      }
      req.user = data;
      next();
    });

  });
  }
  else{
    // TODO: SUBSTITUTE req.user with a dummy user object with a blank stamplist.
    req.user = { _id:"0", id_type:"Anonymous", auth_type:"None", stamplist:{}, social_id:""  };
    next();
  }

});
app.use('/users', users);
app.use('/auth', auth);
app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

/*Handling routes.*/

app.get('/upload',function(req,res){
     fs.readFile('./views/index.html', function (err, html) {
    if (err) {
        throw err; 
    }       
   
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();
});
      //res.sendfile("index.html");
});

app.post('/api/photo',function(req,res){
  if(done==true){
    console.log(req.files);
    res.end("File uploaded.");
  }
});

// catch 404 and forward to error handler

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
//app.use(bodyParser({defer: true}));
 
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
