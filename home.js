var express = require('express');
var app = express();
var credentials = require('./credentials.js');
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
	res.locals.count = count;
	next();
});
app.post('/process', function(req, res){
	var name = req.body.name;
	var comment = req.body.comment;
//	var email = req.body.name2;
	if (name) {
		req.session.name = name;
		console.log('CSRF token (from hidden form field): ' + req.body._csrf);
		console.log('Form (from querystring): ' + req.query.form);
		console.log('Name token (from hidden form field): ' + req.body.name);
		console.log('Email (from visible form field): ' + req.body.email);
		console.log('Password (from visible form field): ' + req.body.pass);
		res.redirect(303, '/redirect');
		count++;
	};
	if (comment) {
		req.session.comment = comment;
		console.log('CSRF token (from hidden form field): ' + req.body._csrf);
		console.log('Form (from querystring): ' + req.query.form);
		console.log('Name token (from visible form field): ' + req.body.name3);
		console.log('Email (from visible form field): ' + req.body.email);
		console.log('Comment (from hidden form field): ' + req.body.comment);
		res.redirect(303, '/thankfeed')
	};
//	if (email) {
//		req.session.name2 = email;
//		console.log('CSRF token (from hidden form field): ' + req.body._csrf);
//		console.log('Form (from querystring): ' + req.query.form);
//		console.log('Name token (from hidden form field): ' + req.body.name2);
//		console.log('Email (from visible form field): ' + req.body.email);
//		console.log('Password (from visible form field): ' + req.body.pass);
//		res.redirect(303, '/redirect')
//	};
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
app.get('/activities', function(req, res) {
	res.render('activities');
});
app.get('/tournaments', function(req, res) {
	res.render('tournaments', { tourneyInfo: tourneyInfo });
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
	res.render('login', { csrf: 'CSRF random value' });
});
//app.get('/register', function(req, res) {
//	res.render('register', { csrf: 'CSRF random value' });
//});
app.get('/logout', function(req, res) {
	delete req.session.name;
	res.redirect(303, '/');
	count--;
});
app.get('/redirect', function(req, res) {
	res.render('redirect');
});
//app.get('/registered', function(req, res) {
//	res.render('registered');
//});
app.use(function(req, res) {
	res.status(404);
	res.render('404');
});
app.use(function(req, res) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log( 'Express started on http://localhost:' + app.get('port') + ': press Ctrl + C to terminate.' );
});
