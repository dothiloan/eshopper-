const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://admin:admin123@ds231643.mlab.com:31643/eshopper';

router.get('/', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		let category = null;
		let brands = null;
		let product = null;

		dbo.collection('products').find({}).limit(6).toArray((err, data) => {
			if(err) throw err;
			product = data;
		});

		dbo.collection('brands').find({}).toArray((err, data) => {
			if(err) throw err;
			brands = data;
		});

		dbo.collection('category').find({}).toArray((err, data) => {
			if(err) throw err;
			category = data;
			
			console.log(category);
		});

		dbo.collection('menu').find({}).toArray((err, data) => {
			if(err) throw err;
			res.render('public/index', {menu : data, category : category, brands : brands, product : product});
		});
	});
});


module.exports = router;