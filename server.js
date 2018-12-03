var http = require('http');
const { parse } = require('querystring');

var users = [{
	id: 1,
	name: 'ismail',
	email: 'ismail@gmail.com',
	avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/256492/_mLIxaKY_400x400.jpg'
},
{
	id: 2,
	name: 'aziz',
	email: 'aziz@waystocap.com',
	avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/256492/_mLIxaKY_400x400.jpg'
},
{
	id: 3,
	email: 'mouad@exemple.com',
	name: 'mouad',
	avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/256492/_mLIxaKY_400x400.jpg'
},
{
	id: 4,
	email: 'zakaria@exemple.com',
	name: 'zakaria',
	avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/256492/_mLIxaKY_400x400.jpg'
},
]
http.createServer(function (req, res) {
	if (req.method == 'GET') {
		console.log('get received')
		res.writeHead(200,
			{
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
			});
		res.end(JSON.stringify(users));
	} else if (req.method == 'PUT') {
		console.log('Post received')
		let user;
		req.on('data', (chunk) => {
			user += chunk.toString()
		});
		req.on('end', () => {
			user = user.replace("undefined", '')
			user = JSON.parse(user)
			console.log(user)
			users[user.id - 1] = user
			//console.log(users)
			res.writeHead(200,
				{
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
				});
			res.end(JSON.stringify(users));
		})

	}
}).listen(8080);