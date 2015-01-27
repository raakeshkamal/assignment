var express = require('express');
var hat=require('hat');
var fs=require('fs');
//var settings = require('./settings');
var https = require('https');
var mongoose=require('mongoose');
//var models = require("./models");
//var error = require("./error");
var bcrypt = require("bcrypt-nodejs");
var Schema=mongoose.Schema;
var router = express.Router();
var ObjectId = Schema.ObjectId;
//var user = models.User;
var User =mongoose.model('User',new Schema({
	username:String,
	password:String,
	date_created:Date,
	upgraded:Date
}));

function newUser( password,username ) {
 var nuser=new User({
  username:username,
  password:password,
  date_created: new Date(),
  upgraded:new Date()
});
nuser.markModified("stamplist");
 return nuser;
}
var token = mongoose.model('Token',new Schema({
	access_token:String,
	account:ObjectId
}));


function newid( tok, acc ){
  var nuser_id = new token({
    access_token:tok,
    account:acc
  });
  return nuser_id;
}
function loginUser( user ){
  var id = hat();
  return newid( id, user ).save().exec();
}

router.get('/create', function( req, res ) {

      if( !req.query.password || !req.query.username ){
        error.err(res,"420");
        return;
      }
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync( req.query.password, salt );

      var vuser = new User({password:hash, username: req.query.username });
      vuser.save();
      var id=hat();
              //console.log(id);
              newid(id,vuser._id).save();
              res.end( JSON.stringify( {result : true, token : id } ) );

      res.end( JSON.stringify({
        result:true,
      }) );

     /* user.save(function(err) {
        if(err) console.log(err);
      });*/

});
router.get('/loginpage', function(req, res) {
  //res.sendfile('views/login.html');
  fs.readFile('./views/login.html', function (err, html) {
    if (err) {
        throw err; 
    }       
   
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();
});
}); 
router.get('/login', function(req, res) {  
  debugger;
   User.findOne({username:req.query.username}, function(err, result) {
      if (err) { console.log("error:") }
      if (result)
      {         
                var id = hat();
                //console.log(id);
                newid( id, result._id ).save();
                res.end( JSON.stringify( {result : true, token : id } ) );
            
            }
          
          else
          {
       
              res.redirect('/auth/create/?username='+req.query.username+'&password='+req.query.password);
            }

       req.on('error', function(e) {
  console.error(e);
});
   });
});

router.get('/login/password', function( req, res ){
  User.findOne( {username: req.query.username}, function( err, user ){
    console.log(user);
    if( !user ){
      error.err(res,"102");
      return;
    }
    if( err ){
      error.err(res,"102");
      return;
    }

    if( bcrypt.compareSync( req.query.password, user.password ) ){
      var token = newid( hat(), user );
      token.save( function( err, token, num ){
        console.log( token );
        res.end( JSON.stringify({ result:true, access_token:token.access_token }) );
      });
    }
    else {
      error.err(res,"212");
    }

  });
});
router.get('/reset/password', function( req, res ){
  var user = req.user;

  var errobj = error.err_insuff_params(res,req,["new_password"]);
  if(!errobj) {
    return;
  }

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync( req.query.new_password, salt );

  user.password = hash;
  user.save();
  res.end(JSON.stringify({ result:true }));

});

router.get('/logout', function( req, res ){
  var user = req.user;
  debugger;
  token.remove({ account: user._id }, function( err, data ){
    console.log( err );
    console.log( data );
  });
  res.end(JSON.stringify({ result:true }));
});
router.get('/profilepage',function(req,res){

});

router.get('/profile',function(req,res){
 

  if( req.user.type == "Anonymous" ){
      error.err(res,"909");
    }
    //  TODO: Remove user private details.. remove password.
    res.end( JSON.stringify( req.user ) );
    var transform = {'tag':'li','html':'${name} (${age})'};
    
  });


module.exports = router;