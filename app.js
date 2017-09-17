/*jshint esversion: 6 */

var express = require('express'),
app = express(),
//pg = require('pg'),
bodyParser = require('body-parser'),
parials = require('express-partials'),
session = require('express-session'),
bcrypt = require('bcrypt'),
reqs = require('request'),
sequelize = require('sequelize');
//client = new pg.Client();
app.set('port', (process.env.PORT || 8080));


//var db = require(__dirname + '/models/database.js');
var db = require(__dirname + '/models/database_test.js');
//var users = new db.Users();



app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',express.static(__dirname + '/bower_components'));

app.use(parials());
//TODO: When doing authentication, change the ID from the user location in the database to the generated session Id and store that with the user
app.use(session({
  secret: 'secret',
  cookie: {maxAge: 2592000},
  resave: true,
  saveUninitialized: true
}));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET REQUESTS */
app.get('/', function(req,res){
  sess = req.session;
  if(sess.logged){
    db.Users.findOne({
      where:{
        id: req.session.user_id
      }
    }).then(user=>{
      res.render('index', {user: user});
    });
  }
  else{
    res.render('index', {user: false});
  }
});

app.get('/login', function(req, res){
  if(!req.session.logged){
    res.render('login', {user: false, alert: false});
  }
  else{
    res.redirect('/');
  }
});

app.get('/about', function(req,res){
  sess = req.session;
  if(sess.logged){
    users.get('id', sess.user_id, function(u){
      user = u[0];
      res.render('about', {user: user});
    });
  }
  else{
    sess.logged = false;
    res.render('about', {user: false});
  }
});


app.get('/beta', (req,res)=>{
  res.render('beta', {user: false});
});


app.get('/sponsors', function(req,res){
  sess = req.session;
  if(sess.logged){
    users.get('id', sess.user_id, function(u){
      user = u[0];
      res.render('sponsors', {user: user});
    });
  }
  else{
    sess.logged = false;
    res.render('sponsors', {user: false});
  }
});


app.get('/contact', function(req,res){
  sess = req.session;
  var alert;

 if(req.query.valid){
   alert = true;
 }
 else{
   alert = false;
 }

  if(sess.logged){
    users.get('id', sess.user_id, function(u){
      user = u[0];
      res.render('contact', {user: user, alert: null});
    });
  }
  else{
    sess.logged = false;
    res.render('contact', {user: false, alert: null});
  }
});

app.get('/robot', (req, res)=>{
  res.render('robot');
});

app.get('/outreach', (req,res)=>{
  res.render('outreach');
});



app.get('/logout', function(req, res){
  req.session.destroy(function(err, result){
    console.log(err);
    res.redirect('/');
  });

});

app.get('/user/login', function(req,res){
  res.redirect('/login');
});

/* POST REQUESTS */

app.post('/user/login', urlencodedParser, function(req,res){
  db.Users.findOne({
    where: {
      email: req.body.email
    }
  }).then(user=>{

    bcrypt.compare(req.body.password, user.get('password'), function(err, result){
      if(result){
        req.session.user_id = user.get('id');
        req.session.logged = true;
        res.redirect('/');
      }
      else{
        res.render('login', {user: false, alert: "Wrong Email or Password"});
      }
  });
  //   if(i.length !== 0){

  //   });
  // }else{
  //       res.render('login', {user: false, alert: "Wrong Email or Password"});
  //     }
     });
   });

app.get("/new", (req,res)=>{
  res.render('new', {user: false});
});

app.post('/user/create', urlencodedParser,function(req,res){
      bcrypt.hash(req.body.password,10, function(err, hash){
        db.Users.create({firstName: req.body.first_name, lastName: req.body.last_name, email: req.body.email, password: hash});

      });
});




app.post('/contact/send', urlencodedParser, (req,res)=>{
  reqs.post(
    'https://hooks.slack.com/services/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',
    { json: {
        text: "New Message from website", attachments:
        [{
          text: "*Name:* " + req.body.name + "\n" + "*Email:* " + req.body.email + "\n" + "*Team Number:* " + req.body.team_number + "\n\n",
          color: '#'+Math.floor(Math.random()*16777215).toString(16),
          mrkdwn_in: ["text"]
        },
        {
          text: "_" + req.body.body + "_",
          color: '#'+Math.floor(Math.random()*16777215).toString(16),
          mrkdwn_in: ["text"]
        }],
   } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.redirect('/contact?valid=sent');
        }
        else{
          res.redirect('/contact?valid=error');
        }
    }
);
});



app.listen(app.get('port'), function(){
  console.log("App running");
});
