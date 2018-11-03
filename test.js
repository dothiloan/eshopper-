const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017/";

MongoClient.connect(url, (err, db) =>{
	if(err) throw err;
	let dbo = db.db('eshopper');
	dbo.collection('order').aggregate([
			{$lookup : {
				from : 'products',
				localField : 'product_id',
				foreignField : '_id',
				as : 'orderDetail'
			}}
		]).toArray((err, data) => {
		if (err) throw err;
		console.log(JSON.stringify(data));
		db.close();
	});
});