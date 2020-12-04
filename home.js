var http = require("http");
var fs = require("fs");
var mysql = require("mysql");
var credentials = require("./credentials");
var qs = require("querystring");var express = require('express');
var app = express();
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
var count = 0;

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
})
if( app.thing == null ) console.log( 'bleat!' );

app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({ secret: 'RandomJumbleofLetters' }));
app.use(function(req, res, next) {
	res.locals.name = req.session.name;
	res.locals.admin = req.session.admin;
	res.locals.count = count;
	next();
});

app.post('/reg', function(req, res, err) {
  var name = req.body.name;
  var email = req.body.email;
	var pass = req.body.pass;
  var users = {
      name: req.body.name,
      email: req.body.email,
			pass: req.body.pass
  }
    var conn = mysql.createConnection(credentials.connection);
		conn.connect(function(err) {
	    if (err) {
	      console.error("ERROR: cannot connect: " + e);
	      return;
	    }
    conn.query('INSERT INTO USERS SET ?', users, function(err, results, rows, fields) {
      if (err) {
        res.locals.message = "It appears there is an issue.";
        res.redirect(303, '/register?error='+err);
      }
			else if (name && email && pass) {
      		conn.query('SELECT * FROM USERS WHERE NAME = ? AND EMAIL = ? AND PASS = ?', [name, email, pass], function(err, results, rows, fields) {
      			if (results.length > 0) {
      				req.session.loggedin = true;
      				req.session.name = name;
              req.session.user_ID = results[0].ID;
              console.log(req.session.user_ID);
      				res.redirect(303, '/registered');
              count++;
      			}
						else {
              res.locals.message = "It appears there is an issue.";
							window.alert("No users match this criteria!");
							res.redirect(303, '/register?error='+err);
      			}
      			res.end();
      		});
					console.log('CSRF token (from hidden form field): ' + req.body._csrf);
					console.log('Form (from querystring): ' + req.query.form);
					console.log('Name token (from hidden form field): ' + req.body.name);
					console.log('Email (from visible form field): ' + req.body.email);
					console.log('Password (from visible form field): ' + req.body.pass);
      	}
				else {
          res.locals.message = "It appears there is an issue.";
					console.log("User did not enter all criteria.")
					res.redirect(303, '/register?error='+err);
      		res.end();
      	}
    });
	});
});
app.post('/log', function(req, res, err){
	var email = req.body.email;
	var pass = req.body.pass;
	if (email && pass) {
		var conn = mysql.createConnection(credentials.connection);
		conn.connect(function(err) {
	    if (err) {
	      console.error("ERROR: cannot connect: " + e);
	      return;
	    }
		conn.query('SELECT * FROM USERS WHERE EMAIL = ? AND PASS = ?', [email, pass], function(err, results, rows, fields) {
	    if (results.length > 0 && results[0].isADMIN === 1) {
	      req.session.loggedin = true;
	      req.session.admin = results[0].NAME;
	      req.session.user_ID = results[0].ID;
	      console.log(req.session.user_ID);
	      count++;
	      res.redirect(303,'/admin');
	    }
			else if (results.length > 0) {
	      req.session.loggedin = true;
	      req.session.name = results[0].NAME;
	      req.session.user_ID = results[0].ID;
	      console.log(req.session.user_ID);
	      count++;
	      res.redirect(303,'/redirect');
	    }
			else {
	      res.locals.message = "It appears there is an issue.";
				console.log("Criteria did yield any matches.")
				res.redirect(303, '/login?error='+err);
	    }
			res.end();
		});
		console.log('CSRF token (from hidden form field): ' + req.body._csrf);
		console.log('Form (from querystring): ' + req.query.form);
		console.log('Name (from hidden form field): ' + req.body.name);
		console.log('Email (from visible form field): ' + req.body.email);
		console.log('Password (from visible form field): ' + req.body.pass);
	});
  }
	else {
    res.locals.message = "It appears there is an issue.";
		console.log("User did not enter all criteria.")
		res.redirect(303, '/login?error=' + err);
		res.end();
	}
});
app.post('/fdbk', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var comment = req.body.comment;
  var submit = {
			name: req.body.name,
			email: req.body.email,
      comment: req.body.comment
    }
		var conn = mysql.createConnection(credentials.connection);
		conn.connect(function(err) {
	    if (err) {
	      console.error("ERROR: cannot connect: " + e);
	      return;
	    }
    	conn.query('INSERT INTO FEEDBACK SET ?', submit, function(err, results, rows, fields) {
      	if (err) {
        	res.locals.message = "It appears there is an issue.";
        	res.redirect(303, '/feedback?error='+err);
      	}
				else {
					console.log('CSRF token (from hidden form field): ' + req.body._csrf);
					console.log('Form (from querystring): ' + req.query.form);
					console.log('Name token (from visible form field): ' + req.body.name);
					console.log('Email (from visible form field): ' + req.body.email);
					console.log('Comment (from visible form field): ' + req.body.comment);
					res.redirect(303, '/thankfeed');
    		}
		})
	})
});
app.post('/tnmt', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var tag = req.body.tag;
	var game = req.body.game;
  var submit = {
			name: req.body.name,
			email: req.body.email,
      tag: req.body.tag,
			game: req.body.game
    }
		var conn = mysql.createConnection(credentials.connection);
		conn.connect(function(err) {
	    if (err) {
	      console.error("ERROR: cannot connect: " + e);
	      return;
	    }
    	conn.query('INSERT INTO TOURNEY SET ?', submit, function(err, results, rows, fields) {
      	if (err) {
        	res.locals.message = "It appears there is an issue.";
        	res.redirect(303, '/tourneyreg?error='+err);
      	}
				else {
					console.log('CSRF token (from hidden form field): ' + req.body._csrf);
					console.log('Form (from querystring): ' + req.query.form);
					console.log('Name token (from visible form field): ' + req.body.name);
					console.log('Email (from visible form field): ' + req.body.email);
					console.log('Gamer Tag (from visible form field): ' + req.body.tag);
					console.log('Game (from visible form field): ' + req.body.game);
					res.redirect(303, '/tnmtredirect');
    		}
		})
	})
});

var tourneyInfo = [
	{
		"game": "Super Smash Bros. Ultimate",
		"time": "3pm",
		"date": "March 25, 2021",
		"description": "Debut tournament at Xenoverse Gaming for the fabled platformer-fighter developed by Masahiro Sakurai.",
		"prize": "$500 for first place, $250 for runner-up, $125 each for the two in third place."
	},
	{
		"game": "Mario Kart 8 Deluxe",
		"time": "3pm",
		"date": "March 26, 2021",
		"description": "Debut tournament at Xenoverse Gaming for Mario Kart 8 Deluxe.",
		"prize": "$500 for first place, $250 for runner-up, $125 each for the two in third place."
	},
	{
		"game": "Splatoon 2",
		"time": "3pm",
		"date": "March 27-28, 2021",
		"description": "Debut tournament at Xenoverse Gaming for Splatoon 2. Planned to last across two days",
		"prize": "$1000 for first place team, $500 for runner-up team."
	},
	{
		"game": "Dragonball FighterZ",
		"time": "3pm",
		"date": "March 24, 2021",
		"description": "Debut tournament at Xenoverse Gaming for Dragonball FighterZ.",
		"prize": "$500 for first place, $250 for runner-up, $125 each for the two in third place."
	}
];
app.get('/', function(req, res) {
	res.render('home');
	res.cookie('xenoverse');
	var xenoblade = req.cookies.xenoverse;
});
app.get('/admin', function(req, res) {
	res.render('admin');
});
app.get('/users', function(req, res) {
	var conn = mysql.createConnection(credentials.connection);
  conn.query('SELECT * FROM USERS', function(err, rows, results, fields){
    console.log(rows);
		res.render('users', { rows: rows });
	});
});
app.get('/userfdbk', function(req, res) {
	var conn = mysql.createConnection(credentials.connection);
  conn.query('SELECT * FROM FEEDBACK', function(err, rows, results, fields){
    console.log(rows);
		res.render('userfdbk', { rows: rows });
	});
});
app.get('/usertnmt', function(req, res) {
	var conn = mysql.createConnection(credentials.connection);
  conn.query('SELECT * FROM TOURNEY', function(err, rows, results, fields){
    console.log(rows);
		res.render('usertnmt', { rows: rows });
	});
});
app.get('/activities', function(req, res) {
	res.render('activities');
});
app.get('/tournaments', function(req, res) {
	res.render('tournaments', { tourneyInfo: tourneyInfo });
});
app.get('/tourneyreg', function(req, res) {
	res.render('tourneyreg', { csrf: 'CSRF random value' });
});
app.get('/tnmtredirect', function(req, res) {
	res.render('tnmtredirect');
});
app.get('/feedback', function(req, res) {
	res.render('feedback', { csrf: 'CSRF random value' });
});
app.get('/contact', function(req, res) {
	res.render('contact');
});
app.get('/games', function(req, res) {
	res.render('games');
});
app.get('/thankfeed', function(req, res) {
	res.render('thankfeed');
});
app.get('/login', function(req, res) {
	res.render('login', { csrf: 'CSRF random value'});
});
app.get('/register', function(req, res) {
	res.render('register', { csrf: 'CSRF random value' });
});
app.get('/logout', function(req, res) {
	delete req.session.name;
	delete req.session.admin;
	res.redirect(303, '/');
	count--;
});
app.get('/redirect', function(req, res) {
	res.render('redirect');
});
app.get('/registered', function(req, res) {
	res.render('registered');
});
app.use(function(req, res) {
	res.status(404);
	res.render('404');
});
app.use(function(req, res, err) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log( 'Express started on http://localhost:' + app.get('port') + ': press Ctrl + C to terminate.' );
});
