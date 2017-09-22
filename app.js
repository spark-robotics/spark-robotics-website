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

var slackToken = "MxYYSBXL3PX0Vuauf0d1kBcJ";






//var db = require(__dirname + '/models/database.js');
var db = require(__dirname + '/models/database_test.js');
//var users = new db.Users();



app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',express.static(__dirname + '/bower_components'));

app.enable('trust proxy');

app.use(parials());
//TODO: When doing authentication, change the ID from the user location in the database to the generated session Id and store that with the user
app.use(session({
  secret: 'secret',
  cookie: {maxAge: 2592000},
  resave: true,
  saveUninitialized: true
}));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function requireAuth(req, res, next){
  if(req.session.logged){
    next();
  }
  else{
    res.redirect('/');
  }
}
function loadCurrentUser(req, res, next){

  if(req.session.logged){
    db.Users.findOne({
      where:{
        id: req.session.user_id
      }
    }).then(user=>{
      req.currentUser = user;
      next();
    });
  } else{
    req.currentUser = false;
    next();
  }
}

/* GET REQUESTS */
app.get('/', loadCurrentUser, function(req,res){
  res.render('index', {user: req.currentUser});
});

app.get('/login', function(req, res){
  if(!req.session.logged){
    res.render('login', {user: false, alert: false});
  }
  else{
    res.redirect('/');
  }
});

app.get('/about', loadCurrentUser, function(req,res){
  res.render('about', {user: req.currentUser});
});


app.get('/beta', loadCurrentUser, requireAuth, (req,res)=>{
  res.render('beta', {user: req.currentUser});
});


app.get('/sponsors', loadCurrentUser, function(req,res){
  var sponsors;
  db.Sponsors.findAll().then(s=>{
    sponsors = s;
  }).then(e=>{
    res.render('sponsors', {user: req.currentUser, sponsors: sponsors});
  });

});


app.get('/contact', loadCurrentUser, function(req,res){
  sess = req.session;
  var alert;

 if(req.query.valid){
   alert = true;
 }
 else{
   alert = false;
 }

  res.render('contact', {user: req.currentUser});
});

app.get('/robot', loadCurrentUser, (req, res)=>{
  res.render('robot', {user: req.currentUser});
});

app.get('/outreach',loadCurrentUser, (req,res)=>{
  res.render('outreach', {user: req.currentUser});
});



app.get('/admin', loadCurrentUser, requireAuth, (req,res)=>{
  res.render('admin', {user: req.currentUser});
});



app.get('/logout', function(req, res){
  req.session.destroy(function(err, result){
    console.log(err);
    res.redirect('/');
  });

});

app.get('/user/login', loadCurrentUser, function(req,res){
  res.redirect('/login', {user: req.currentUser});
});

/* POST REQUESTS */

app.post('/user/login', urlencodedParser, function(req,res){
  db.Users.findOne({
    where: {
      email: req.body.email
    }
  }).then(user=>{
    bcrypt.compare(req.body.password, user.get('password'), function(err, result){
      console.log(result);
      if(result){
        req.session.user_id = user.get('id');
        req.session.logged = true;
        console.log(req.session.user_id);
        res.redirect('/');

      }
      else{
        res.render('login', {user: false, alert: "Wrong Email or Password"});
      }
  });
     });
   });

app.get("/new", (req,res)=>{
  res.render('new', {user: false});
});

app.post('/add/sponsor', urlencodedParser,(req,res)=>{
  console.log(req.body.name);
  db.Sponsors.create({name: req.body.name, donation: req.body.donation, img_url: req.body.img_url, url: req.body.url});
  res.redirect('/sponsor');
});

app.post('/user/create', urlencodedParser,function(req,res){
      bcrypt.hash(req.body.password,10, function(err, hash){
        db.Users.create({firstName: req.body.first_name, lastName: req.body.last_name, email: req.body.email, password: hash});

      });
});

app.post('/slack/block_ip', urlencodedParser, (req,res)=>{
  res.status(200).end();
  var payload = JSON.parse(req.body.payload);
  if(payload.token == slackToken){
    db.BannedIps.create({ip: payload.actions[0].value});
  }
  console.log("IP Banned: " + payload.actions[0].value);
});


app.post('/contact/send', urlencodedParser, (req,res)=>{
    var name = req.body.name;
    var number = req.body.team_number;
    var body = req.body.body;
    var ip = req.ip;
    var valid = true;



    db.BannedIps.findAll().then(ips=>{
      for(var i = 0; i < ips.length; i++){
        if(ip == ips[i].ip){
          console.log(ips[i].ip);
          valid = false;
          console.log("BANNED");
          break;
        }
      }
    }).then(e=>{

      if(valid){
        reqs.post(
          'https://hooks.slack.com/services/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',
          { json: {
              text: "New Message from website",
              attachments:[{
                text: "*Name:* " + req.body.name + "\n" + "*Email:* " + req.body.email + "\n" + "*Team Number:* " + req.body.team_number + "\n\n" + "*IP:* " + ip,
                color: '#'+Math.floor(Math.random()*16777215).toString(16),
                mrkdwn_in: ["text"]
              },
              {
                text: "_" + req.body.body + "_",
                color: '#'+Math.floor(Math.random()*16777215).toString(16),
                mrkdwn_in: ["text"]
              },
              {
                title: "Would you like to block this IP?",
                fallback: "Unable to block this IP",
                callback_id: "metke_alpha_beta",
                attachment_type: "default",
                actions: [
                     {
                         name: "block",
                         text: "Block",
                         type: "button",
                         value: ip +""
                     },
                 ]
              }
            ],
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
      }
      else{
        res.redirect('/contact');
      }



    });


console.log(valid);

});




app.listen(app.get('port'), function(){
  console.log("App running");
});
