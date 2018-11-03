const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const index = require('./index');
const admin = require('./admin');
const login = require('./login');
const cookieParser = require('cookie-parser');
app.listen(3000, (req, res) => {
	console.log('da nhan');
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
//app.use(express.static('images'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(cookieParser());

app.use('/', index);
app.use('/admin', admin);
app.use('/login', login);