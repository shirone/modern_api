const hapi = require('hapi');
const mongoose = require('mongoose');
const s3 = require('hapi-s3');
const slug = require('slug');
const Travel = require('./models/Travel');

const port = process.env.PORT || 4000;
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/pathravel')
// mongoose.connect(`mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@ds141320.mlab.com:41320/pathravel`);

mongoose.connection.once('open', () => {
	console.log('Connected to database');
});

mongoose.connection.on('error', () => {
	 console.error.bind(console, 'MongoDB connection error:');
});

const server = hapi.server({
	port : port,
	host : 'localhost'
});

const init = async () => {
	server.route([
		{
			method 	: 'GET',
			path	: '/',
			handler	: (request, reply) => {
				return `PONG`
			}
		},
		{
			method 	: 'GET',
			path	: '/api/v1/travels',
			handler	:  (request, reply) => {
				return Travel.find();
			}
		},
		{
			method 	: 'POST',
			path	: '/api/v1/travels',
			handler	: (request, reply) => {
				const {name, place} = request.payload;
				const travel = new Travel({
					name,
					url : slug(name),
					place
				});

				return travel.save();
			}
		},
		{
			method : 'GET',
	        path   : '/bucket',
	        async handler(request) {
	            const { s3 } = request.server;
	            const buckets = await s3.listBuckets();
	          	return buckets;
        	}
		}


	]);
	await server.register({
        plugin  : s3,
        options : {
            publicKey : process.env.AWS_ACCESS_KEY_ID,
            secretKey : process.env.AWS_SECRET_ACCESS_KEY,
            bucket : 'leccalab'
        }
    });
	await server.start();
	console.log(`Server running at ${server.info.uri}`);
};

init();