/*jshint esversion: 6 */

var express = require('express'),
app = express(),
pg = require('pg'),
bodyParser = require('body-parser'),
parials = require('express-partials'),
session = require('express-session'),
bcrypt = require('bcrypt');
client = new pg.Client();
port = 8080;

var db = require(__dirname + '/models/database.js');

var users = new db.Users();
var messages = new db.Messages();

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

    users.get('id', sess.user_id, function(u){
      user = u[0];

      res.render('index', {user: user});
    });
  }
  else{
    sess.logged = false;
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
  if(sess.logged){
    users.get('id', sess.user_id, function(u){
      user = u[0];
      res.render('contact', {user: user, alert: false});
    });
  }
  else{
    sess.logged = false;
    res.render('contact', {user: false, alert: false});
  }
});

app.get('/admin', function(req,res){
  sess = req.session;
  if(sess.logged){
    users.get('id', sess.user_id, u=>{
      user = u[0];
      messages.get_all(m=>{
        console.log(m[0].name);
        res.render('admin', {user: user, messages: m});
      });
    });
  }
  else{
    res.redirect('/');
  }
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
  users.get('email', req.body.email, function(i){
    if(i.length !== 0){

      bcrypt.compare(req.body.password, i[0].password, function(err, result){
        if(result){
          req.session.user_id = i[0].id;
          req.session.logged = true;
          res.redirect('/');
        }
        else{
          res.render('login', {user: false, alert: "Wrong Email or Password"});
        }
    });
  }else{
        res.render('login', {user: false, alert: "Wrong Email or Password"});
      }


    });
  });

app.post('/contact/new', urlencodedParser, function(req,res){
  sess = req.session;
  if(!sess.logged){
  messages.insert(req.body.name, req.body.email, req.body.team_number, req.body.body, function(result){
      console.log(req.body.name + ":" + req.body.email + ":" + req.body.team_number + ":" + req.body.body);
      res.render('contact', {user: false, alert: "Message Sent! We'll send an email back as soon as we can."});
  });
}else{
    res.redirect('/');
}
});

app.post('/user/create', urlencodedParser,function(req,res){
      bcrypt.hash(req.body.password,10, function(err, hash){
        let id;
        users.insert(req.body.name, req.body.email, hash, function(user){
            req.session.logged = true;
            req.session.user_id = user[0].id;
            res.redirect('/');
        });

      });
});

app.listen(port, function(){
  console.log("App running on " + port);
});
