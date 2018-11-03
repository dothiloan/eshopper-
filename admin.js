const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://admin:admin123@ds231643.mlab.com:31643/eshopper';
const multer  = require('multer');
const objectId = require('mongodb').ObjectID;
const setMd5 = require('md5');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.static('public'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
  	let filename = file.originalname;
		let path = /(?<=\.).*/i;
		let result = path.exec(filename);
    cb(null, file.fieldname + '-' + Date.now() + '.' + result[0]);
  }
})

var upload = multer({ storage: storage });

router.use(function (req, res, next) {
	if(req.cookies.login == 'true'){
		next();
	}else{

		res.redirect('/login');
	};
});

router.get('/', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('users').find({}).toArray((err, data) => {
			if(err) throw err;
			res.render('admin/index', {data : data.length});

		});

	});

});

router.get('/add-users.html', (req, res, next) => {
	let err = req.cookies;
	MongoClient.connect(url, (error, db) => {
		if (error) throw "Can not connect to db";
		let dbo = db.db('eshopper');
		dbo.collection('citys').find({}).toArray((error, data) => {
			if(error) throw 'Select data false';
			if(data == null) throw 'Data empty';
			res.clearCookie('userError');
			res.clearCookie('passwordError');
			res.clearCookie('emailError');
			res.clearCookie('fullnameError');
			res.clearCookie('birthdayError');
			res.clearCookie('pathimagesError');
			res.render('admin/users/add', {data : data,err : err});
		});
		db.close();

	});

});

router.post('/add-users.html',upload.single('avatar'), (req, res, next) => {
	let pathimages;
	if(req.file == undefined){
		pathimages = "";
	}else{
		let filename = req.file.originalname;
		let path = /(?<=\.).*/i;
		let result = path.exec(filename);
		pathimages = req.file.filename;
	}

	let username = req.body.username;
	let password = req.body.password;
	let email =  req.body.email;
	let sex =  req.body.sex;
	let fullname =  req.body.fullname;
	let birthday =  req.body.birthday;
	let address =  req.body.address;
	let comment =  req.body.comment;
	let active = req.body.active;

	if(pathimages=="" || username == "" || password == "" || email == "" || sex == "" || fullname == "" || birthday == "" ||address == "" ||comment == ""){
		if(username == ""){
			res.cookie('userError', '* Tên đăng nhập không được để trống');
		};
		if(password == ""){
			res.cookie('passwordError', '* Mật khẩu không được để trống');
		};
		if(email == ""){
			res.cookie('emailError', '* Email không được để trống');
		};
		if(sex == ""){
			res.cookie('sexError', '* Giới tính không được để trống');
		};
		if(fullname == ""){
			res.cookie('fullnameError', '* Họ và tên không được để trống');
		};
		if(birthday == ""){
			res.cookie('birthdayError', '* Ngày sinh không được để trống');
		};
		if(address == ""){
			res.cookie('addressError', '* Địa chỉ không được để trống');
		};
		if(pathimages == ""){
			res.cookie('pathimagesError', '* Ảnh đại diện không được để trống');
		};

		res.redirect('/admin/add-users.html');
	}else{
		let data = {
			username : username,
			password : setMd5(password),
			email : email,
			fullname : fullname,
			birthday : birthday,
			sex : sex,
			avatar : pathimages,
			address : address,
			comment : comment,
			active : active,
		};

		MongoClient.connect(url, (err, db) => {
		if(err) throw 'Can not connect';
		let dbo = db.db('eshopper');
			dbo.collection('users').insertOne(data, (err, result) => {
				if(err) throw err;

			});
			db.close();
		});
		res.redirect('/admin');
		}

});

router.get('/show-users.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		let message = req.cookies.showMessage;
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('users').find({}).toArray((err, data) => {
			if(err) throw err;
			res.clearCookie('showMessage');
			res.render('admin/users/show-users', {data : data, showMessage : message});
		});
	});
});

router.get('/delete/:id', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('users').deleteOne({_id : objectId(req.params.id)}, (err, data) => {
			if(err) throw err;
			res.cookie('showMessage', 'Tác vụ thành công');
			res.redirect('/admin/show-users.html');

		});
		db.close();

	});

});

router.get('/edit-users/:id', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		let city = '';
		dbo.collection('citys').find({}).toArray((error, data) => {
			if(error) throw 'Select data false';
			if(data == null) throw 'Data empty';
			//console.log(data);
			city = data;
		});


		dbo.collection('users').find({_id : objectId(req.params.id)}).toArray((err, data) => {
			if(err) throw err;
			res.render('admin/users/edit-users', {data : data, city : city});
		});

	});

});

router.post('/edit-users',upload.single('avatar'), (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		let myQuery = {_id : objectId(req.body.id)};
		let pathimages;
			if(req.file == undefined){
				pathimages = "";
			}else{
				let filename = req.file.originalname;
				let path = /(?<=\.).*/i;
				let result = path.exec(filename);
				pathimages = req.file.filename;
			}
		let newValue = {$set: {email : req.body.email, fullname : req.body.fullname, address : req.body.address, comment : req.body.comment, sex : req.body.sex, birthday : req.body.birthday, avatar : pathimages}};
		dbo.collection('users').updateOne(myQuery,newValue, (err, data) => {
			if(err) throw err;
			db.close();
			res.redirect('/admin/show-users.html');
		});
		
	});
});



router.get('/add-brands.html', (req, res, next) => {
	res.render('admin/brands/add-brands');
});

router.post('/add-brands.html', (req, res, next) => {
	if(req.body.id == "" || req.body.nameBrand == ""){
		if(req.body.id == ""){
			res.cookie('idError', '* Id không được để trống');
		};
		if(req.body.nameBrand == ""){
			res.cookie('nameBrandError', '* Tên nhãn hiệu không được để trống');
		};
	}else{
		MongoClient.connect(url, (err, db) => {
			if(err) throw err;
			let dbo = db.db('eshopper');
			dbo.collection('brands').insertOne(req.body, (err, data) => {
				if(err) throw err;
			});
			db.close();
		});
		res.redirect('/admin/add-brands.html');
	};
});

router.get('/show-brands.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('brands').find({}).toArray((err, data) => {
			if(err) throw err;
			res.render('admin/brands/show-brands', {data : data});
		});
	});
});

router.get('/delete-brands/:id', (req, res, next) => {
	//console.log(req.params);
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('brands').deleteOne({_id : objectId(req.params.id)}, (err, data) => {
			if(err) throw err;

		});
		res.redirect('/admin/show-brands.html');
		db.close();
	});
});

router.get('/edit/:id', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('brands').find({_id : objectId(req.params.id)}).toArray((err, data) => {
			if(err) throw err;
			//console.log(data);
			res.render('admin/brands/edit-brands', {data : data});
		});
		db.close();
	});
});

router.post('/edit', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		let item = {_id : objectId(req.body._id)};
		let newValue = {$set : {id : req.body.id, nameBrand : req.body.nameBrand }};

		dbo.collection('brands').update(item, newValue, (err, data) => {
			if (err) throw err;
			db.close();
		});
		
	});
	res.redirect('/admin/show-brands.html');
});


router.get('/add-menu.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) =>{
		if (err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('menu').find({}).toArray((err, data) => {
			if (err) throw err;
			res.render('admin/menu/add-menu', {data : data});
		});
	});
	
});

router.post('/add-menu.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if (err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('menu').insertOne(req.body, (err, data) =>{
			if (err) throw err;
			console.log('da them');
			db.close();
		});
	});
	res.redirect('/admin/add-menu.html');
});

router.get('/add-category.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) =>{
		if (err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('category').find({}).toArray((err, data) => {
			if (err) throw err;
			res.render('admin/category/add-category', {data : data});
		});
	});
	
});

router.post('/add-category.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if (err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('category').insertOne(req.body, (err, data) =>{
			if (err) throw err;

			db.close();
		});
	});
	res.redirect('/admin/add-category.html');
});

router.get('/show-category.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('category').find({}).toArray((err, data) => {
			if(err) throw err;
			res.render('admin/category/show-category', {data : data});
		});
	});
}); 

router.get('/delete-category/:id', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('category').deleteOne({_id : objectId(req.params.id)}, (err, data) => {
			if(err) throw err;
			res.redirect('/admin/show-category.html');

		});
		db.close();

	});

});

router.get('/add-product.html', (req, res, next) => {
	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		let dbo = db.db('eshopper');
		let category = null;
		let brand = null;

		dbo.collection('brands').find({}).toArray((err, data) => {
			if (err) throw err;
			brand = data;
		});

		dbo.collection('category').find({}).toArray((err, data) => {
			if (err) throw err;
			category = data;
			res.render('admin/products/add-products', {category : category, brand : brand});
		});
	});
	
});

router.post('/add-product.html', upload.single('productImage'), (req, res, next) => {
	let pathimages;
	if(req.file == undefined){
		pathimages = "";
	}else{
		let filename = req.file.originalname;
		let path = /(?<=\.).*/i;
		let result = path.exec(filename);
		pathimages = req.file.filename;
		console.log(pathimages);
	}
	let productsName = req.body.productsName;
	let productsPrice = req. body.productsPrice;
	let productsCategory = req.body.productCategory;
	let productsBrand = req. body.productBrand;
	let productsImage = pathimages;

	let results = {
			productsName : productsName,
			productsPrice : productsPrice,
			productCategory : productsCategory,
			productBrand : productsBrand,
			productImage : productsImage
		};

	MongoClient.connect(url, (err, db) => {
		if (err) throw err;
		let dbo = db.db('eshopper');
		dbo.collection('products').insertOne(results, (err, data) => {
			if (err) throw err;
			console.log(data);
			db.close();
			res.redirect('/admin/add-product.html');
		});
	});
});
module.exports = router;
