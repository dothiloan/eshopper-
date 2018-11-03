const express = require('express');
const app = express();
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://admin:admin123@ds231643.mlab.com:31643/eshopper';
const setMd5 = require('md5');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

router.get('/', (req, res, next) => {
	if(req.cookies.login == 'true') {
		res.redirect('/admin');
	}else{
		res.render('login/index');
	};
});

router.post('/', (req, res, next) => {
	let username = req.body.username;
	let password = setMd5(req.body.password);

	
		MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		let condition = {$and : [{username : username}, {password : password}]};
		dbo.collection('users').find(condition).toArray((err, data) => {
			if(err) throw err;
			if(data.length >= 1) {
				res.cookie('login', 'true');
				res.redirect('/admin');
			}else{
				res.redirect('/login');
			}
			
		});
	});
	

});

router.get('/logout', (req, res, next) => {
	res.clearCookie('login');
	res.redirect('/login');
});

module.exports = router;